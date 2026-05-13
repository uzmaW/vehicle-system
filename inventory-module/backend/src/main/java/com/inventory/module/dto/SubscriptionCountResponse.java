package com.inventory.module.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for subscription count statistics.
 * 
 * Used by the admin endpoint to report dealer counts by subscription type.
 * This is a global count across all tenants (requires GLOBAL_ADMIN role).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionCountResponse {

    private long basic;
    private long premium;

    /**
     * Creates a response from counts.
     */
    public static SubscriptionCountResponse of(long basicCount, long premiumCount) {
        return SubscriptionCountResponse.builder()
                .basic(basicCount)
                .premium(premiumCount)
                .build();
    }
}