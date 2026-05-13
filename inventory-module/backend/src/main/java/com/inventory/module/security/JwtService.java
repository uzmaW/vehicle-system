package com.inventory.module.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Set;

/**
 * Service for JWT token generation and validation.
 *
 * JWT contains: userId, email, tenantId, role
 * Token is signed with HS256 and includes expiration.
 */
@Slf4j
@Service
public class JwtService {

    private static final long EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    private final SecretKey secretKey;
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    public JwtService(@Value("${jwt.secret:your-256-bit-secret-key-for-jwt-signing-min-32-chars}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate JWT token for authenticated user.
     */
    public String generateToken(String userId, String email, String tenantId, UserRole role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_MS);

        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("tenantId", tenantId)
                .claim("role", role.name())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    /**
     * Validate token and extract claims.
     *
     * @param token JWT token
     * @return claims if valid, null if invalid/blacklisted
     */
    public Claims validateToken(String token) {
        if (blacklistedTokens.contains(token)) {
            log.debug("Token is blacklisted");
            return null;
        }

        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract user ID from token.
     */
    public String getUserId(Claims claims) {
        return claims.getSubject();
    }

    /**
     * Extract email from token.
     */
    public String getEmail(Claims claims) {
        return claims.get("email", String.class);
    }

    /**
     * Extract tenant ID from token.
     */
    public String getTenantId(Claims claims) {
        return claims.get("tenantId", String.class);
    }

    /**
     * Extract role from token.
     */
    public UserRole getRole(Claims claims) {
        String roleStr = claims.get("role", String.class);
        return roleStr != null ? UserRole.valueOf(roleStr) : UserRole.STANDARD;
    }

    /**
     * Blacklist a token (logout).
     */
    public void blacklistToken(String token) {
        blacklistedTokens.add(token);
        log.debug("Token blacklisted");
    }

    /**
     * Check if token is blacklisted.
     */
    public boolean isBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }
}
