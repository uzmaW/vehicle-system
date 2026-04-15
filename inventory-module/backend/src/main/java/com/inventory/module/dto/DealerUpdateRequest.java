package com.inventory.module.dto;

import com.inventory.module.domain.SubscriptionType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating an existing Dealer.
 * 
 * All fields are optional - only provided fields will be updated.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealerUpdateRequest {

    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String name;

    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    private SubscriptionType subscriptionType;
}