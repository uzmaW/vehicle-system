package com.inventory.module.dto;

import com.inventory.module.domain.SubscriptionType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for tenant registration.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantRegisterRequest {

    @NotBlank(message = "Tenant name is required")
    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 50, message = "Phone number must be less than 50 characters")
    private String phone;

    private SubscriptionType subscriptionType;

    // Admin user details for the tenant
    @NotBlank(message = "Admin user name is required")
    @Size(min = 2, max = 255, message = "Admin name must be between 2 and 255 characters")
    private String adminName;

    @NotBlank(message = "Admin password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String adminPassword;
}