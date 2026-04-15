package com.inventory.module.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Dealer Entity representing a dealership organization within a tenant.
 * 
 * This entity is tenant-aware and uses Hibernate filters to enforce
 * data isolation at the ORM level. The discriminator column approach
 * ensures all queries are automatically scoped to the current tenant.
 */
@Entity
@Table(name = "dealers", indexes = {
    @Index(name = "idx_dealer_tenant", columnList = "tenant_id"),
    @Index(name = "idx_dealer_tenant_subscription", columnList = "tenant_id, subscription_type"),
    @Index(name = "idx_dealer_tenant_email", columnList = "tenant_id, email", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = String.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class Dealer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Tenant discriminator column for multi-tenancy support.
     * This field is mandatory and ensures data isolation between tenants.
     */
    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    /**
     * Business name of the dealership.
     */
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    /**
     * Contact email - must be unique within the tenant boundary.
     */
    @Column(name = "email", nullable = false, length = 255)
    private String email;

    /**
     * Subscription tier determining available features and visibility.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_type", nullable = false, length = 20)
    private SubscriptionType subscriptionType;

    /**
     * Vehicles associated with this dealer.
     * Cascade operations ensure vehicles are managed with the dealer.
     */
    @OneToMany(mappedBy = "dealer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Vehicle> vehicles = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Adds a vehicle to this dealer's inventory.
     * Ensures bidirectional relationship is maintained.
     */
    public void addVehicle(Vehicle vehicle) {
        vehicles.add(vehicle);
        vehicle.setDealer(this);
    }

    /**
     * Removes a vehicle from this dealer's inventory.
     */
    public void removeVehicle(Vehicle vehicle) {
        vehicles.remove(vehicle);
        vehicle.setDealer(null);
    }
}