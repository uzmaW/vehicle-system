package com.inventory.module.dto;

import com.inventory.module.domain.SubscriptionType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new Dealer.
 * 
 * Validation ensures:
 * - Name is required and within size limits
 * - Email is required and must be valid format
 * - Subscription type is required
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealerCreateRequest {

    @NotBlank(message = "Dealer name is required")
    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @NotNull(message = "Subscription type is required")
    private SubscriptionType subscriptionType;
}