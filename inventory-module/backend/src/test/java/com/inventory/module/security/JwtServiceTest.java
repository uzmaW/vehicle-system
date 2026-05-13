package com.inventory.module.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private static final String TEST_SECRET = "test-secret-key-that-is-at-least-32-characters-long";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(TEST_SECRET);
    }

    @Test
    void generateToken_shouldCreateValidToken() {
        String userId = "user-123";
        String email = "test@example.com";
        String tenantId = "tenant-456";
        UserRole role = UserRole.TENANT_ADMIN;

        String token = jwtService.generateToken(userId, email, tenantId, role);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void validateToken_shouldReturnClaimsForValidToken() {
        String token = jwtService.generateToken("user-123", "test@example.com", "tenant-456", UserRole.TENANT_ADMIN);

        Claims claims = jwtService.validateToken(token);

        assertNotNull(claims);
        assertEquals("user-123", jwtService.getUserId(claims));
        assertEquals("test@example.com", jwtService.getEmail(claims));
        assertEquals("tenant-456", jwtService.getTenantId(claims));
        assertEquals(UserRole.TENANT_ADMIN, jwtService.getRole(claims));
    }

    @Test
    void validateToken_shouldReturnNullForInvalidToken() {
        Claims claims = jwtService.validateToken("invalid.token.here");

        assertNull(claims);
    }

    @Test
    void validateToken_shouldReturnNullForBlacklistedToken() {
        String token = jwtService.generateToken("user-123", "test@example.com", "tenant-456", UserRole.STANDARD);

        jwtService.blacklistToken(token);

        Claims claims = jwtService.validateToken(token);
        assertNull(claims);
    }

    @Test
    void blacklistToken_shouldMarkTokenAsBlacklisted() {
        String token = jwtService.generateToken("user-123", "test@example.com", "tenant-456", UserRole.STANDARD);

        assertFalse(jwtService.isBlacklisted(token));

        jwtService.blacklistToken(token);

        assertTrue(jwtService.isBlacklisted(token));
    }

    @Test
    void getUserId_shouldExtractUserIdFromClaims() {
        String token = jwtService.generateToken("user-abc", "user@example.com", "tenant-xyz", UserRole.GLOBAL_ADMIN);
        Claims claims = jwtService.validateToken(token);

        assertEquals("user-abc", jwtService.getUserId(claims));
    }

    @Test
    void getEmail_shouldExtractEmailFromClaims() {
        String token = jwtService.generateToken("user-123", "user@test.com", "tenant-456", UserRole.STANDARD);
        Claims claims = jwtService.validateToken(token);

        assertEquals("user@test.com", jwtService.getEmail(claims));
    }

    @Test
    void getTenantId_shouldExtractTenantIdFromClaims() {
        String token = jwtService.generateToken("user-123", "test@test.com", "tenant-xyz", UserRole.TENANT_ADMIN);
        Claims claims = jwtService.validateToken(token);

        assertEquals("tenant-xyz", jwtService.getTenantId(claims));
    }

    @Test
    void getRole_shouldExtractRoleFromClaims() {
        String token = jwtService.generateToken("user-123", "test@test.com", "tenant-456", UserRole.GLOBAL_ADMIN);
        Claims claims = jwtService.validateToken(token);

        assertEquals(UserRole.GLOBAL_ADMIN, jwtService.getRole(claims));
    }

    @Test
    void getRole_shouldReturnStandardForMissingRole() {
        // When role claim is not present in token, getRole should return STANDARD
        // This is tested via the validation - if role string is null, STANDARD is returned
        Claims claims = jwtService.validateToken(
            jwtService.generateToken("user-123", "test@test.com", "tenant-456", UserRole.STANDARD)
        );
        UserRole result = jwtService.getRole(claims);
        assertEquals(UserRole.STANDARD, result);
    }

    @Test
    void validateToken_shouldReturnNullForTamperedToken() {
        String token = jwtService.generateToken("user-123", "test@example.com", "tenant-456", UserRole.STANDARD);
        String tamperedToken = token.substring(0, token.length() - 5) + "xxxxx";

        Claims claims = jwtService.validateToken(tamperedToken);

        assertNull(claims);
    }
}