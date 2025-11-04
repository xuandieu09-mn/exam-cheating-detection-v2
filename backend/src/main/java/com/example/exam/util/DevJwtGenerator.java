package com.example.exam.util;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.*;

/**
 * Dev-only utility: generate an RS256 JWT using classpath key at keys/dev-private.pem.
 * Usage:
 *   - No args: subject="dev-user", roles=["USER"], expires=120 minutes
 *   - With args: <subject> [rolesCSV] [expiresMinutes]
 */
public class DevJwtGenerator {

    public static void main(String[] args) throws Exception {
        String subject = args.length > 0 ? args[0] : "dev-user";
        String rolesCsv = args.length > 1 ? args[1] : "USER";
        int expiresMin = args.length > 2 ? Integer.parseInt(args[2]) : 120;

        List<String> roles = rolesCsv.isBlank() ? List.of("USER") : Arrays.stream(rolesCsv.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();

        PrivateKey privateKey;
        try {
            privateKey = loadPrivateKeyFromPem("/keys/dev-private.pem");
        } catch (Exception ex) {
            System.out.println("[dev] Không tìm thấy/không đọc được private key trong classpath. Sẽ tạo cặp khóa mới...");
            KeyPairResult kp = generateRsaKeyPair();
            writeDevKeysToProject(kp);
            privateKey = kp.privateKey();
            System.out.println("[dev] Đã tạo dev keypair và lưu vào src/main/resources/keys. Hãy chạy lại `mvn -q -DskipTests package` để build lại app.");
        }

        String token = createJwt(privateKey, subject, roles, expiresMin);

        System.out.println("JWT (RS256):\n" + token + "\n");
        System.out.println("Authorization header:\nBearer " + token);
    }

    private record KeyPairResult(PrivateKey privateKey, java.security.PublicKey publicKey) {}

    private static KeyPairResult generateRsaKeyPair() throws Exception {
        var kpg = java.security.KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
        var kp = kpg.generateKeyPair();
        return new KeyPairResult(kp.getPrivate(), kp.getPublic());
    }

    private static void writeDevKeysToProject(KeyPairResult kp) throws IOException {
        String projectDir = System.getProperty("user.dir");
        java.nio.file.Path keysDir = java.nio.file.Paths.get(projectDir, "src", "main", "resources", "keys");
        java.nio.file.Files.createDirectories(keysDir);

        // Private key PKCS#8
        byte[] priv = kp.privateKey().getEncoded();
        String privPem = toPem("PRIVATE KEY", priv);
        java.nio.file.Files.writeString(keysDir.resolve("dev-private.pem"), privPem, StandardCharsets.UTF_8);

        // Public key X.509 SubjectPublicKeyInfo
        byte[] pub = kp.publicKey().getEncoded();
        String pubPem = toPem("PUBLIC KEY", pub);
        java.nio.file.Files.writeString(keysDir.resolve("dev-public.pem"), pubPem, StandardCharsets.UTF_8);

        System.out.println("[dev] Ghi khóa: " + keysDir.resolve("dev-private.pem"));
        System.out.println("[dev] Ghi khóa: " + keysDir.resolve("dev-public.pem"));
    }

    private static String toPem(String type, byte[] der) {
        String b64 = Base64.getMimeEncoder(64, "\n".getBytes(StandardCharsets.UTF_8)).encodeToString(der);
        return "-----BEGIN " + type + "-----\n" + b64 + "\n-----END " + type + "-----\n";
    }

    private static PrivateKey loadPrivateKeyFromPem(String classpathLocation) throws Exception {
        String pem = readClasspathResource(classpathLocation);
        String sanitized = pem.replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        byte[] keyBytes = Base64.getDecoder().decode(sanitized);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePrivate(spec);
    }

    private static String readClasspathResource(String path) throws IOException {
        try (InputStream is = DevJwtGenerator.class.getResourceAsStream(path)) {
            if (is == null) throw new IOException("Resource not found: " + path);
            try (BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) sb.append(line).append('\n');
                return sb.toString();
            }
        }
    }

    private static String createJwt(PrivateKey privateKey, String subject, List<String> roles, int expiresMinutes) throws Exception {
        Instant now = Instant.now();
        Date iat = Date.from(now);
        Date exp = Date.from(now.plusSeconds(expiresMinutes * 60L));

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(subject)
                .issuer("dev-local")
                .audience("exam-backend")
                .issueTime(iat)
                .expirationTime(exp)
                .claim("roles", roles)
                .build();

        JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.RS256)
                .keyID("dev-key-1")
                .type(JOSEObjectType.JWT)
                .build();

        SignedJWT jwt = new SignedJWT(header, claims);
        JWSSigner signer = new RSASSASigner(privateKey);
        jwt.sign(signer);
        return jwt.serialize();
    }
}
