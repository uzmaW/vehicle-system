package com.inventory.module.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter.
 *
 * Validates JWT tokens from Authorization header and sets UserContext/TenantContext.
 * This filter runs before TenantFilter to ensure JWT claims are available.
 *
 * Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Validate token using JwtService
 * 3. If valid, set UserContext and TenantContext from JWT claims
 * 4. Continue filter chain
 * 5. Always clear context after request (in finally block)
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(AUTHORIZATION_HEADER);
        String token = extractToken(authHeader);

        if (token != null) {
            Claims claims = jwtService.validateToken(token);
            if (claims != null) {
                // Token is valid - set context from JWT claims
                String userId = jwtService.getUserId(claims);
                String email = jwtService.getEmail(claims);
                String tenantId = jwtService.getTenantId(claims);
                UserRole role = jwtService.getRole(claims);

                UserContext.setUserContext(userId, email, role);
                TenantContext.setTenantId(tenantId);

                log.debug("JWT authenticated: userId={}, tenantId={}, role={}",
                         userId, tenantId, role);
            } else {
                log.debug("Invalid or blacklisted JWT token");
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Always clear context to prevent leakage
            UserContext.clear();
            TenantContext.clear();
            log.debug("Context cleared after request");
        }
    }

@Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip JWT filter for public endpoints but NOT for /auth/me which requires authentication
        return path.startsWith("/api/auth/login") ||
                path.startsWith("/api/tenants/register") ||
               path.startsWith("/actuator") ||
               path.startsWith("/h2-console") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs");
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            return authHeader.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}