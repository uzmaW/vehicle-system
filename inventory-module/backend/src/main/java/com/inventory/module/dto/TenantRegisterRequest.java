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
}