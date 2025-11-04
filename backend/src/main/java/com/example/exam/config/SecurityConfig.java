package com.example.exam.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${security.require-auth:false}")
    private boolean requireAuth;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable());

        // Always allow Swagger/OpenAPI endpoints for dev ergonomics
        var auth = http.authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
        );

    if (requireAuth) {
        auth.authorizeHttpRequests(registry -> registry
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .requestMatchers("/api/**").hasAnyRole("USER", "ADMIN")
            .anyRequest().permitAll()
        );
            // Map custom "roles" claim -> ROLE_* authorities for Spring Security
            JwtAuthenticationConverter jwtAuthConverter = new JwtAuthenticationConverter();
            jwtAuthConverter.setJwtGrantedAuthoritiesConverter(this::mapRolesClaimToAuthorities);

            http.oauth2ResourceServer(oauth2 -> oauth2
                    .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter))
            );
        } else {
            auth.authorizeHttpRequests(registry -> registry.anyRequest().permitAll());
        }

        return http.build();
    }

    private Collection<GrantedAuthority> mapRolesClaimToAuthorities(Jwt jwt) {
        List<String> roles = jwt.getClaimAsStringList("roles");
        if (roles == null) return List.of();
        return roles.stream()
                .filter(r -> r != null && !r.isBlank())
                .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }
}
