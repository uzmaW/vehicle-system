package com.inventory.module.dto;

import com.inventory.module.domain.SubscriptionType;
import com.inventory.module.domain.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Vehicle response data.
 * 
 * Includes dealer information for display purposes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {

    private UUID id;
    private UUID dealerId;
    private String dealerName;
    private SubscriptionType dealerSubscriptionType;
    private String model;
    private BigDecimal price;
    private VehicleStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}