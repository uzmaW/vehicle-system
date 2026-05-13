package com.inventory.module.dto;

import com.inventory.module.domain.SubscriptionType;
import com.inventory.module.domain.Tenant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for tenant data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantResponse {

    private Long id;
    private String uuid;
    private String name;
    private String email;
    private String phone;
    private SubscriptionType subscriptionType;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Creates a TenantResponse from a Tenant entity.
     */
    public static TenantResponse fromEntity(Tenant tenant) {
        return TenantResponse.builder()
                .id(tenant.getId())
                .uuid(tenant.getUuid())
                .name(tenant.getName())
                .email(tenant.getEmail())
                .phone(tenant.getPhone())
                .subscriptionType(tenant.getSubscriptionType())
                .active(tenant.getActive())
                .createdAt(tenant.getCreatedAt())
                .updatedAt(tenant.getUpdatedAt())
                .build();
    }
}