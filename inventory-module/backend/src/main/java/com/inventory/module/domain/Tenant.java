package com.inventory.module.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tenant Entity representing a tenant organization in the multi-tenant system.
 *
 * Tenants must register through the API before they can access any data.
 * Each tenant has a unique UUID and subscription details.
 */
@Entity
@Table(name = "tenants",
    indexes = {
        @Index(name = "idx_tenant_name", columnList = "name")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_tenant_uuid", columnNames = "uuid"),
        @UniqueConstraint(name = "uk_tenant_email", columnNames = "email")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    /**
     * Public-facing UUID for tenant identification.
     * Used in API requests as X-Tenant-Id header.
     */
    @Column(name = "uuid", nullable = false, updatable = false, unique = true, length = 36)
    private String uuid;

    /**
     * Tenant organization name.
     */
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    /**
     * Contact email - unique per tenant.
     */
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    /**
     * Contact phone number.
     */
    @Column(name = "phone", length = 50)
    private String phone;

    /**
     * Subscription tier.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_type", nullable = false, length = 20)
    @Builder.Default
    private SubscriptionType subscriptionType = SubscriptionType.BASIC;

    /**
     * Whether the tenant is active/approved.
     */
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = false;

    /**
     * Registration timestamp.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Last update timestamp.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}