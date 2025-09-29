package io.ssafy.cinemoa.security.config;

import io.ssafy.cinemoa.security.enums.Role;
import io.ssafy.cinemoa.security.filter.OAuthTokenFilter;
import io.ssafy.cinemoa.security.handler.CustomAccessDeniedHandler;
import io.ssafy.cinemoa.security.handler.CustomAuthenticationEntryPoint;
import io.ssafy.cinemoa.security.handler.CustomLogoutSuccessHandler;
import io.ssafy.cinemoa.security.service.CustomUserDetailsService;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String[] PERMIT_ALL_PATHS = {
            "/api/auth/login/oauth2/code/**",
            "/api/funding/search",
            "/api/funding/recommended-funding",
            "/api/funding/expiring",
            "/api/category",
            "/api/cinema/**",
            "/api/screen/**",
            "/api/image/**",
            "/api/search"
    };

    private static final String[] PERMIT_ANONYMOUS = {
            "/api/wonauth/**"
    };

    private static final String[] NOTIFICATION_PATHS = {
            "/api/notification/**"
    };

    @Value("${uploader.user}")
    private String uploaderUserName;

    @Value("${uploader.pass}")
    private String uploaderPassword;

    private final OAuthTokenFilter oAuthTokenFilter;
    private final CustomUserDetailsService userDetailsService;
    private final CustomLogoutSuccessHandler logoutSuccessHandler;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityContextRepository repository)
            throws Exception {
        PathPatternRequestMatcher matcher = PathPatternRequestMatcher.withDefaults()
                .matcher(HttpMethod.GET, "/api/funding/{fundingId}");
        http
                .securityMatcher("/api/**")
                .csrf(AbstractHttpConfigurer::disable)
                .userDetailsService(userDetailsService)
                .securityContext(s -> s.securityContextRepository(repository))
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy((SessionCreationPolicy.IF_REQUIRED))
                        .maximumSessions(10)
                        .maxSessionsPreventsLogin(false))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler(logoutSuccessHandler)
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID"))
                .exceptionHandling(e -> e.accessDeniedHandler(accessDeniedHandler)
                        .authenticationEntryPoint(authenticationEntryPoint))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PERMIT_ALL_PATHS)
                        .permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()
                        .requestMatchers(matcher).permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/user/**")
                        .hasAnyRole(Role.USER.getRole(), Role.ANONYMOUS.getRole())
                        .requestMatchers(PERMIT_ANONYMOUS).hasAnyRole(Role.USER.getRole(),
                                Role.ANONYMOUS.getRole())
                        .requestMatchers(NOTIFICATION_PATHS).hasRole(Role.USER.getRole())
                        .requestMatchers("/api/**").hasRole(Role.USER.getRole())
                        .anyRequest().authenticated())
                .addFilterBefore(oAuthTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    @Order(0)
    public SecurityFilterChain securityFilterChainForColab(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .securityMatcher("/api/image/animated")
                .httpBasic(Customizer.withDefaults())
                .authorizeHttpRequests(a -> a.requestMatchers("/api/image/animated")
                        .hasRole(Role.UPLOADER.name()))
                .cors(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable)
                .userDetailsService(uploaderAuthService())
                .build();
    }

    private UserDetailsService uploaderAuthService() {
        UserDetails uploader = User.withUsername(uploaderUserName)
                .password(passwordEncoder.encode(uploaderPassword))
                .roles(Role.UPLOADER.name())
                .build();

        return new InMemoryUserDetailsManager(uploader);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(
                List.of("http://localhost:3000", "https://j13a110.p.ssafy.io", "https://cinemoa.shop"));
        config.setAllowedMethods(Arrays.stream(HttpMethod.values()).map(HttpMethod::toString).toList());
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }


}
