package com.inventory.module.dto;

import com.inventory.module.domain.SubscriptionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Dealer response data.
 * 
 * Excludes sensitive internal fields and provides a clean API response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealerResponse {

    private UUID id;
    private String name;
    private String email;
    private SubscriptionType subscriptionType;
    private Integer vehicleCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}