package com.stockmind.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * [VIVA SEARCH: SECURITY ARCHITECTURE] & [VIVA SEARCH: JWT VERIFICATION] & [VIVA SEARCH: OAUTH2 RESOURCE SERVER]
 * Configures Spring Security as a stateless OAuth2 Resource Server.
 * Validates cryptographically signed JWT bearer tokens from Supabase Auth via JWKS.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${stockmind.security.enabled:true}") boolean securityEnabled) throws Exception {

        // [VIVA SEARCH: STATELESS SESSIONS] & [VIVA SEARCH: CSRF]
        // Disables CSRF (not needed for stateless REST APIs) and enforces STATELESS session management
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        if (securityEnabled) {
            http
                    // [VIVA SEARCH: ROUTE AUTHORIZATION]
                    // Public endpoints: Preflight OPTIONS requests and /api/health check
                    // All other /api/* endpoints require a valid Supabase JWT Bearer token
                    .authorizeHttpRequests(authorize -> authorize
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                            .requestMatchers("/api/health").permitAll()
                            .anyRequest().authenticated())
                    // [VIVA SEARCH: JWT RESOURCE SERVER]
                    // Configures JWT decoding against Supabase public JWKS key set
                    .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        } else {
            http.authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());
        }

        return http.build();
    }
}
