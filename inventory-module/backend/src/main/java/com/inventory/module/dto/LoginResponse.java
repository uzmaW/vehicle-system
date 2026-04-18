package com.inventory.module.dto;

import com.inventory.module.security.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for successful login.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String tokenType;
    private long expiresIn;
    private String userId;
    private String email;
    private String tenantId;
    private UserRole role;
}
