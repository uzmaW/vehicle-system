package com.inventory.module.controllers;

import com.inventory.module.domain.User;
import com.inventory.module.dto.LoginRequest;
import com.inventory.module.dto.LoginResponse;
import com.inventory.module.repositories.UserRepository;
import com.inventory.module.security.JwtService;
import com.inventory.module.security.TenantContext;
import com.inventory.module.security.UserContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for authentication.
 *
 * Provides login/logout endpoints for JWT-based authentication.
 * All other endpoints will use JWT filter for authentication.
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final long TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

    private final UserRepository userRepository;
    private final JwtService jwtService;

    /**
     * Login with email and password.
     * Returns JWT token if credentials are valid.
     *
     * @param request login credentials
     * @return JWT token and user info
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: user not found for email: {}", request.getEmail());
                    return new SecurityException("Invalid email or password");
                });

        // Check if user is active
        if (!Boolean.TRUE.equals(user.getActive())) {
            log.warn("Login failed: user is inactive: {}", request.getEmail());
            throw new SecurityException("User account is inactive");
        }

        // Validate password (plain text comparison - use BCrypt in production)
        if (!user.getPassword().equals(request.getPassword())) {
            log.warn("Login failed: invalid password for email: {}", request.getEmail());
            throw new SecurityException("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtService.generateToken(
                user.getUuid(),
                user.getEmail(),
                user.getTenantId(),
                user.getRole()
        );

        log.info("Login successful for user: {} ({})", user.getUuid(), user.getRole());

        return ResponseEntity.ok(LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(TOKEN_EXPIRY_MS / 1000)
                .userId(user.getUuid())
                .email(user.getEmail())
                .tenantId(user.getTenantId())
                .role(user.getRole())
                .build());
    }

    /**
     * Logout - invalidate current token.
     * Requires valid JWT token in Authorization header.
     *
     * @param authorization Bearer token
     * @return success message
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader("Authorization") String authorization) {
        String token = extractToken(authorization);

        if (token != null) {
            jwtService.blacklistToken(token);
            log.info("User logged out successfully");
        }

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /**
     * Get current user info.
     * Requires valid JWT token.
     *
     * @return current user info from token
     */
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getCurrentUser() {
        return ResponseEntity.ok(LoginResponse.builder()
                .userId(UserContext.getUserId())
                .email(UserContext.getEmail())
                .tenantId(TenantContext.getTenantId())
                .role(UserContext.getUserRole())
                .build());
    }

    private String extractToken(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }
}
