package com.inventory.module.dto;

import com.inventory.module.domain.SubscriptionType;
import com.inventory.module.domain.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for vehicle search/filter parameters.
 * 
 * All filters are optional and can be combined.
 * Supports:
 * - Model name (partial match)
 * - Status filter
 * - Price range
 * - Dealer subscription type filter
 * - Pagination and sorting
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleSearchRequest {

    private String model;
    private VehicleStatus status;
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private SubscriptionType subscription;
    
    // Pagination
    @Builder.Default
    private Integer page = 0;
    @Builder.Default
    private Integer size = 20;
    
    // Sorting
    @Builder.Default
    private String sortBy = "createdAt";
    @Builder.Default
    private String sortDirection = "DESC";

    /**
     * Checks if any filter criteria are provided.
     */
    public boolean hasFilters() {
        return model != null || status != null || 
               priceMin != null || priceMax != null || 
               subscription != null;
    }
}