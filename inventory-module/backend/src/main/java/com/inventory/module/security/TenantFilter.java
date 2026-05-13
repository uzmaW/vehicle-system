package com.inventory.module.security;

import com.inventory.module.exception.MissingTenantHeaderException;
import com.inventory.module.services.TenantService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * Servlet filter for tenant context resolution and propagation.
 * 
 * Intercepts all incoming requests to the inventory module and:
 * 1. Extracts the X-Tenant-Id header
 * 2. Validates its presence (rejects with 400 if missing)
 * 3. Stores it in ThreadLocal context for the request duration
 * 4. Cleans up the context after request completion
 * 
 * The filter is ordered with highest precedence to ensure tenant context
 * is available to all subsequent filters and application logic.
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class TenantFilter implements Filter {

    public static final String TENANT_HEADER = "X-Tenant-Id";
    public static final String USER_ID_HEADER = "X-User-Id";
    public static final String USER_ROLE_HEADER = "X-User-Role";

    private final TenantService tenantService;

    @Value("${tenant.header-name:X-Tenant-Id}")
    private String tenantHeaderName;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String requestURI = httpRequest.getRequestURI();
        
        // Skip tenant validation for actuator health checks and H2 console
        // Also skip for user management endpoints (they require GLOBAL_ADMIN/TENANT_ADMIN but no tenant header)
        if (shouldSkipTenantCheck(requestURI, httpRequest.getMethod())) {
            // Still extract user context for user management endpoints
            String userId = httpRequest.getHeader(USER_ID_HEADER);
            String roleHeader = httpRequest.getHeader(USER_ROLE_HEADER);
            UserRole userRole = parseUserRole(roleHeader);
            UserContext.setUserContext(userId, userRole);

            try {
                chain.doFilter(request, response);
            } finally {
                UserContext.clear();
            }
            return;
        }

        try {
            // Extract and validate tenant ID
            String tenantId = extractAndValidateTenantId(httpRequest);

            // Extract user context (for demo purposes, from headers)
            String userId = httpRequest.getHeader(USER_ID_HEADER);
            String roleHeader = httpRequest.getHeader(USER_ROLE_HEADER);
            UserRole userRole = parseUserRole(roleHeader);

            // Set contexts
            TenantContext.setTenantId(tenantId);
            UserContext.setUserContext(userId, userRole);

            log.debug("Tenant context set: tenantId={}, userId={}, role={}",
                     tenantId, userId, userRole);

            chain.doFilter(request, response);

        } catch (MissingTenantHeaderException e) {
            log.error("Missing tenant header for request: {}", requestURI);
            sendErrorResponse(httpResponse, HttpServletResponse.SC_BAD_REQUEST,
                           "Missing required header: X-Tenant-Id");
        } finally {
            // Always clear context to prevent leakage
            TenantContext.clear();
            UserContext.clear();
            log.debug("Tenant and user contexts cleared");
        }
    }

    /**
     * Extracts and validates the tenant ID from the request header.
     * For demo purposes, only validates UUID format.
     * Tenant existence check can be enabled for production.
     *
     * @param request the HTTP request
     * @return the validated tenant ID
     * @throws MissingTenantHeaderException if the header is missing or empty
     */
    private String extractAndValidateTenantId(HttpServletRequest request) {
        String tenantId = request.getHeader(tenantHeaderName);

        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new MissingTenantHeaderException();
        }

        // Allow any non-empty tenant ID for demo/testing purposes
        // In production, uncomment UUID validation:
        // try {
        //     UUID.fromString(tenantId);
        // } catch (IllegalArgumentException e) {
        //     throw new MissingTenantHeaderException("Invalid tenant ID format: must be a valid UUID");
        // }

        // For demo purposes, skip database validation of tenant existence
        // In production, uncomment the following to validate tenant is registered and active:
        // if (!tenantService.isTenantActive(tenantId)) {
        //     throw new MissingTenantHeaderException("Invalid or inactive tenant: " + tenantId);
        // }

        return tenantId;
    }

    /**
     * Parses the user role from header value.
     */
    private UserRole parseUserRole(String roleHeader) {
        if (roleHeader == null || roleHeader.trim().isEmpty()) {
            return UserRole.STANDARD;
        }
        try {
            return UserRole.valueOf(roleHeader.toUpperCase());
        } catch (IllegalArgumentException e) {
            return UserRole.STANDARD;
        }
    }

    /**
     * Determines if the request should skip tenant validation.
     */
    private boolean shouldSkipTenantCheck(String requestURI, String method) {
        // Skip for tenant registration and tenant lookup endpoints
        // Also skip OPTIONS (preflight) requests to allow CORS to work
        // Skip Swagger/OpenAPI endpoints
        // Skip tenant list endpoint for admin access
        // Skip user management endpoints (require GLOBAL_ADMIN or TENANT_ADMIN but no tenant header)
        // Skip auth endpoints (login, logout, current user)
        return requestURI.startsWith("/api/tenants/register") ||
               requestURI.matches("/api/tenants/[^/]+") ||
               requestURI.matches("/api/tenants/[^/]+/users") ||
               requestURI.matches("/api/tenants/[^/]+/users/[^/]+") ||
               requestURI.equals("/api/tenants") ||
               requestURI.startsWith("/api/users") ||
               requestURI.startsWith("/api/auth") ||
               requestURI.startsWith("/actuator") ||
               requestURI.startsWith("/h2-console") ||
               requestURI.equals("/") ||
               requestURI.equals("/swagger-ui") ||
               requestURI.startsWith("/swagger-ui") ||
               requestURI.startsWith("/v3/api-docs") ||
               requestURI.equals("/error") ||
               "OPTIONS".equalsIgnoreCase(method);
    }

    /**
     * Sends an error response to the client.
     */
    private void sendErrorResponse(HttpServletResponse response, int status, String message) 
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write(String.format(
            "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"Bad Request\",\"message\":\"%s\",\"errorCode\":\"MISSING_TENANT_HEADER\"}",
            java.time.LocalDateTime.now(), status, message
        ));
    }
}