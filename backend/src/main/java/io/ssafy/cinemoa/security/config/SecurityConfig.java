package io.ssafy.cinemoa.security.config;

import io.ssafy.cinemoa.security.filter.OAuthTokenFilter;
import io.ssafy.cinemoa.security.handler.CustomAccessDeniedHandler;
import io.ssafy.cinemoa.security.handler.CustomAuthenticationEntryPoint;
import io.ssafy.cinemoa.security.handler.CustomLogoutSuccessHandler;
import io.ssafy.cinemoa.security.service.CustomUserDetailsService;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String[] PERMIT_ALL_PATHS = {
            "/api/login/oauth2/code/**",
            "/api/funding/search",
            "/api/funding/recommended-funding",
            "/api/funding/expiring",
            "/api/category",
            "/api/cinema/**",
            "/api/screen/**",
            "/api/search"
    };

    private final OAuthTokenFilter oAuthTokenFilter;
    private final CustomUserDetailsService userDetailsService;
    private final CustomLogoutSuccessHandler logoutSuccessHandler;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/**")
                .csrf(AbstractHttpConfigurer::disable)
                .userDetailsService(userDetailsService)
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy((SessionCreationPolicy.IF_REQUIRED))
                        .maximumSessions(1)
                        .maxSessionsPreventsLogin(false))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler(logoutSuccessHandler)
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID"))
                .exceptionHandling(e ->
                        e.accessDeniedHandler(accessDeniedHandler)
                                .authenticationEntryPoint(authenticationEntryPoint))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PERMIT_ALL_PATHS)
                        .permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(oAuthTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "https://j13a110.p.ssafy.io"));
        config.setAllowedMethods(Arrays.stream(HttpMethod.values()).map(HttpMethod::toString).toList());
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
