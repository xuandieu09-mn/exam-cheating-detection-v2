import { TokenRepository } from "./token-repository";

async function refreshAccessToken(token) {
  try {
    const url = process.env.AUTH_SERVER_TOKEN_URL || "http://localhost:9000/oauth2/token";

    const storedRefreshToken = await TokenRepository.getRefreshToken(token.sub);

    if (!storedRefreshToken) {
      console.error("No refresh token found server-side for user", token.sub);
      throw new Error("NoRefreshToken");
    }

    const basicAuth = Buffer.from(
      `${process.env.BFF_CLIENT_ID}:${process.env.BFF_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`,
      },
      method: "POST",
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: storedRefreshToken,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Refresh token error response:", response.status, text.substring(0, 200));
      throw new Error("RefreshAccessTokenError");
    }

    const refreshedTokens = await response.json();

    if (refreshedTokens.refresh_token) {
      await TokenRepository.saveRefreshToken(token.sub, refreshedTokens.refresh_token);
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in * 1000),
    };
  } catch (error) {
    console.error("RefreshAccessTokenError", error);
    await TokenRepository.deleteRefreshToken(token.sub);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    {
      id: "exam-oidc",
      name: "Exam Platform Identity",
      type: "oauth",
      wellKnown: undefined,
      authorization: {
        // Use external URL (accessible from browser) for authorization endpoint
        url: (process.env.AUTH_SERVER_EXTERNAL_URL || "http://localhost:9000") + "/oauth2/authorize",
        params: {
          scope: "openid profile exam.read exam.write",
        }
      },
      token: {
        // Use internal URL (container-to-container) for token endpoint
        url: process.env.AUTH_SERVER_TOKEN_URL || "http://localhost:9000/oauth2/token",
      },
      userinfo: {
        // Use internal URL (container-to-container) for userinfo endpoint
        url: process.env.AUTH_SERVER_USERINFO_URL || "http://localhost:9000/userinfo"
      },
      // Use internal URL for JWKS endpoint
      jwks_endpoint: (process.env.AUTH_SERVER_URL || "http://localhost:9000") + "/oauth2/jwks",
      idToken: true,
      checks: ["pkce", "state"],
      clientId: process.env.BFF_CLIENT_ID,
      clientSecret: process.env.BFF_CLIENT_SECRET,
      client: {
        token_endpoint_auth_method: "client_secret_basic",
      },
      // Use external issuer URL for JWT validation (tokens are issued with external URL)
      issuer: process.env.AUTH_SERVER_EXTERNAL_URL || process.env.AUTH_SERVER_ISSUER || "http://localhost:9000",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.preferred_username || profile.name,
          email: profile.email,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        console.log("[JWT Callback] User ID:", user.id, "Username:", user.name);
        console.log("[JWT Callback] Account expires_in:", account.expires_in, "seconds");

        const expiresInSeconds = account.expires_in || 300;
        const expiresAt = Date.now() + (expiresInSeconds * 1000);
        console.log("[JWT Callback] Token will expire at:", new Date(expiresAt).toISOString());

        if (account.refresh_token) {
          console.log("[JWT Callback] Refresh token length:", account.refresh_token.length);
          await TokenRepository.saveRefreshToken(user.id, account.refresh_token);
        } else {
          console.log("[JWT Callback] No refresh token in account");
        }

        return {
          accessToken: account.access_token,
          accessTokenExpires: expiresAt,
          idToken: account.id_token,
          user,
          sub: user.id
        };
      }

      const now = Date.now();
      const expiresIn = Math.floor((token.accessTokenExpires - now) / 1000);
      console.log(`[JWT Callback] Token check - expires in ${expiresIn} seconds`);

      const storedRefreshToken = await TokenRepository.getRefreshToken(token.sub);
      if (!storedRefreshToken) {
        console.log("[JWT Callback] No refresh token in database - session invalidated");
        throw new Error("SessionInvalidated");
      }

      if (now < token.accessTokenExpires - 15000) {
        console.log("[JWT Callback] Token still valid, using cached token");
        return token;
      }

      console.log("[JWT Callback] Token expired or expiring soon, refreshing...");
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.error = token.error;
      return session;
    },
    async signOut({ token }) {
      // Revoke refresh token from database
      if (token?.sub) {
        console.log(`[SignOut] Revoking refresh token for user ${token.sub}`);
        try {
          await TokenRepository.deleteRefreshToken(token.sub);
          console.log(`[SignOut] Successfully revoked refresh token for user ${token.sub}`);
        } catch (error) {
          console.error(`[SignOut] Error revoking refresh token:`, error);
        }
      }
    },
    async redirect({ url, baseUrl }) {
      const reactClientUrl = process.env.REACT_CLIENT_URL || "http://localhost:5174";
      const authServerIssuer = process.env.AUTH_SERVER_ISSUER || "http://localhost:9000";

      console.log("[Redirect Callback] url:", url, "baseUrl:", baseUrl);

      if (url.startsWith(authServerIssuer)) {
        console.log("[Redirect Callback] Allowing redirect to Authorization Server");
        return url;
      }

      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        const reactUrlObj = new URL(reactClientUrl);

        if (urlObj.origin !== baseUrlObj.origin && urlObj.origin !== reactUrlObj.origin) {
          console.log("[Redirect Callback] Allowing external redirect");
          return url;
        }
      } catch (e) {
      }

      if (url.startsWith(reactClientUrl)) {
        console.log("[Redirect Callback] Redirecting to React client");
        return url;
      }

      if (url.startsWith("/") || url === baseUrl) {
        console.log("[Redirect Callback] Converting relative/base URL to React client");
        return reactClientUrl;
      }

      if (url.startsWith(baseUrl)) {
        console.log("[Redirect Callback] Converting BFF URL to React client");
        return reactClientUrl;
      }

      console.log("[Redirect Callback] Allowing URL as-is:", url);
      return url;
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.BFF_SESSION_COOKIE || `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
};