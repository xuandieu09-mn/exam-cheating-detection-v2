package com.examplatform.auth.config;

import com.examplatform.auth.crypto.Jwks;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.lob.DefaultLobHandler;
import org.springframework.jdbc.support.lob.LobHandler;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.jackson2.SecurityJackson2Modules;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.jackson2.OAuth2AuthorizationServerJackson2Module;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

import javax.sql.DataSource;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebSecurity
public class AuthorizationServerSecurityConfig {

    private final AuthServerProperties properties;

    public AuthorizationServerSecurityConfig(AuthServerProperties properties) {
        this.properties = properties;
    }

    // ---------- JSON deserializer for Spring security modules ----------
    public static class SmartListDeserializer extends JsonDeserializer<List<?>> {
        @Override
        public List<?> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            ObjectMapper mapper = (ObjectMapper) p.getCodec();
            JsonNode node = mapper.readTree(p);
            List<Object> result = new ArrayList<>();
            if (node.isArray()) {
                for (JsonNode element : node) {
                    if (element.isArray() && element.size() == 2 && element.get(0).isTextual()) {
                        try {
                            String className = element.get(0).asText();
                            Class.forName(className);
                            JsonNode valueNode = element.get(1);
                            result.add(mapper.treeToValue(valueNode, Object.class));
                            continue;
                        } catch (Exception e) {
                            // ignore and fall back
                        }
                    }
                    result.add(mapper.treeToValue(element, Object.class));
                }
            }
            return result;
        }
    }

    @JsonDeserialize(using = SmartListDeserializer.class)
    public abstract class SafeListMixin {}

    // ---------- Security filter chains ----------
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                .authorizationEndpoint(auth -> auth.consentPage("/oauth2/consent"))
                .oidc(oidc -> oidc.logoutEndpoint(Customizer.withDefaults()));
        http.exceptionHandling(ex -> ex.defaultAuthenticationEntryPointFor(
                new LoginUrlAuthenticationEntryPoint("/login"),
                new MediaTypeRequestMatcher(MediaType.TEXT_HTML)))
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
            .csrf(csrf -> csrf.ignoringRequestMatchers("/connect/logout"))
            .cors(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain appSecurityFilterChain(HttpSecurity http) throws Exception {
        String origin = "http://localhost:5174";
        try {
            if (properties.cors() != null && properties.cors().allowedOrigins() != null &&
                properties.cors().allowedOrigins().length > 0) {
                if (properties.spaClient() != null && properties.spaClient().redirectUri() != null) {
                    java.net.URI uri = java.net.URI.create(properties.spaClient().redirectUri());
                    origin = uri.getScheme() + "://" + uri.getAuthority();
                } else {
                    origin = properties.cors().allowedOrigins()[0];
                }
            }
        } catch (Exception ignored) {}
        final String spaDefaultOrigin = origin;
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/actuator/info", "/login", "/oauth2/consent", "/error").permitAll()
                .anyRequest().authenticated())
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl(spaDefaultOrigin)
                .permitAll())
            .logout(logout -> logout
                .logoutRequestMatcher(new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/logout", "GET"))
                .logoutSuccessHandler((request, response, authentication) -> {
                    String redirectUrl = request.getParameter("post_logout_redirect_uri");
                    if (redirectUrl == null || redirectUrl.isEmpty()) {
                        redirectUrl = request.getParameter("redirect_uri");
                    }
                    if (redirectUrl == null || redirectUrl.isEmpty()) {
                        redirectUrl = spaDefaultOrigin;
                    }
                    response.sendRedirect(redirectUrl);
                })
                .permitAll())
            .csrf(csrf -> csrf.ignoringRequestMatchers("/logout", "/login"));
        return http.build();
    }

    // ---------- Beans ----------
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public RegisteredClientRepository registeredClientRepository(JdbcTemplate jdbcTemplate) {
        return new JdbcRegisteredClientRepository(jdbcTemplate);
    }

    @Bean
    public LobHandler lobHandler() {
        return new DefaultLobHandler();
    }

    @Bean
    public OAuth2AuthorizationService authorizationService(JdbcTemplate jdbcTemplate,
                                                         RegisteredClientRepository registeredClientRepository,
                                                         LobHandler lobHandler) {
        JdbcOAuth2AuthorizationService service = new JdbcOAuth2AuthorizationService(jdbcTemplate, registeredClientRepository);
        JdbcOAuth2AuthorizationService.OAuth2AuthorizationRowMapper rowMapper = new JdbcOAuth2AuthorizationService.OAuth2AuthorizationRowMapper(registeredClientRepository);
        rowMapper.setLobHandler(lobHandler);
        ObjectMapper objectMapper = new ObjectMapper();
        ClassLoader cl = JdbcOAuth2AuthorizationService.class.getClassLoader();
        List<Module> modules = SecurityJackson2Modules.getModules(cl);
        objectMapper.registerModules(modules);
        objectMapper.registerModule(new OAuth2AuthorizationServerJackson2Module());
        objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_INVALID_SUBTYPE, false);
        objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        try {
            objectMapper.addMixIn(Class.forName("java.util.ImmutableCollections$ListN"), SafeListMixin.class);
            objectMapper.addMixIn(Class.forName("java.util.ImmutableCollections$List12"), SafeListMixin.class);
        } catch (ClassNotFoundException ignored) {}
        rowMapper.setObjectMapper(objectMapper);
        service.setAuthorizationRowMapper(rowMapper);
        return service;
    }

    @Bean
    public OAuth2AuthorizationConsentService authorizationConsentService(JdbcTemplate jdbcTemplate,
                                                                       RegisteredClientRepository registeredClientRepository) {
        return new JdbcOAuth2AuthorizationConsentService(jdbcTemplate, registeredClientRepository);
    }

    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer(properties.issuer())
                .build();
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        JWKSet jwkSet = new JWKSet(Jwks.generateRsa());
        return (selector, securityContext) -> selector.select(jwkSet);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> allowedOrigins = properties.cors() != null && properties.cors().allowedOrigins() != null
                ? List.of(properties.cors().allowedOrigins())
                : List.of("http://localhost:5173", "http://localhost:5174");
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> authoritiesClaimCustomizer() {
        return context -> {
            if (context.getPrincipal() == null) return;
            context.getClaims().claim("authorities",
                    context.getPrincipal().getAuthorities().stream()
                            .map(grantedAuthority -> grantedAuthority.getAuthority())
                            .toList());
        };
    }
}