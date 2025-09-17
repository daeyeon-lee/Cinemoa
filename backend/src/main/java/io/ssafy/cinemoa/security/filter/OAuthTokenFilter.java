package io.ssafy.cinemoa.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.security.dto.LoginResponseDto;
import io.ssafy.cinemoa.security.dto.OAuthTokenVerifyDto;
import io.ssafy.cinemoa.security.entity.CustomUserDetails;
import io.ssafy.cinemoa.security.enums.Role;
import io.ssafy.cinemoa.security.service.OAuthUserService;
import io.ssafy.cinemoa.user.repository.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuthTokenFilter extends OncePerRequestFilter {
    private static final String PATH = "/api/login/oauth2/code/**";
    private static final PathPatternRequestMatcher PATH_REQUEST_MATCHER = PathPatternRequestMatcher.withDefaults()
            .matcher(HttpMethod.POST, PATH);
    private final ObjectMapper objectMapper;
    private final OAuthUserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!PATH_REQUEST_MATCHER.matches(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            validateRequest(request);

            String messageBody = StreamUtils.copyToString(request.getInputStream(), StandardCharsets.UTF_8);
            OAuthTokenVerifyDto dto = objectMapper.readValue(messageBody, OAuthTokenVerifyDto.class);
            String vendor = extractVendor(request);

            validateCredentials(vendor, dto);

            User user = userService.loadUserWithToken(vendor, dto.getToken());
            setAuthentication(user);

            writeSuccessResponse(response, user);

        } catch (Exception e) {
            log.error("OAuth 인증 실패: {}", e.getMessage(), e);
            writeErrorResponse(response, e);
        }
    }

    private void validateRequest(HttpServletRequest request) {
        if (request.getContentType() == null ||
                !request.getContentType().contains(MediaType.APPLICATION_JSON_VALUE)) {
            throw new AuthenticationServiceException(
                    "Content-Type " + request.getContentType() + " is not supported");
        }
    }

    private void validateCredentials(String vendor, OAuthTokenVerifyDto dto) {
        if (vendor.isBlank() || dto.getToken() == null || dto.getToken().isBlank()) {
            throw new AuthenticationCredentialsNotFoundException("Invalid credentials");
        }
    }

    private String extractVendor(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.substring(uri.lastIndexOf("/") + 1);
    }

    private void setAuthentication(User user) {
        // User를 UserDetails로 변환 (기존 UserDetails 구현체 사용)
        CustomUserDetails userDetails = CustomUserDetails.of(user); // 또는 기존 방식 사용

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null,
                userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private void writeSuccessResponse(HttpServletResponse response, User user) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        // 성공 응답 DTO 생성
        LoginResponseDto loginResponse = LoginResponseDto.builder()
                .userId(user.getId())
                .email(user.getUsername())
                .isAnonymous(user.getRole().equals(Role.ANONYMOUS))
                .build();

        String jsonResponse = objectMapper.writeValueAsString(ApiResponse.ofSuccess(loginResponse));
        response.getWriter().write(jsonResponse);
    }

    private void writeErrorResponse(HttpServletResponse response, Exception e) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        String jsonResponse = objectMapper.writeValueAsString(ApiResponse.ofFail("인증 실패", -1));
        response.getWriter().write(jsonResponse);
    }
}
