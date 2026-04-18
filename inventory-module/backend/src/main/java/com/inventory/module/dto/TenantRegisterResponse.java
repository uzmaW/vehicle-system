package com.inventory.module.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for tenant registration, including the first admin user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantRegisterResponse {

    private TenantResponse tenant;
    private UserResponse adminUser;
}
