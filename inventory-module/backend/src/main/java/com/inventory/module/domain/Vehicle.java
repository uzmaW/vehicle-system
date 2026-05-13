package com.inventory.module.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Vehicle Entity representing inventory items listed by a Dealer.
 * 
 * This entity is tenant-aware and uses Hibernate filters to enforce
 * data isolation at the ORM level. Each vehicle is intrinsically
 * linked to both a dealer and a tenant.
 * 
 * Business Rules:
 * - A vehicle cannot be created without a valid dealer reference
 * - The dealer and the vehicle must reside within the same tenant
 * - Cross-tenant vehicle-dealer associations are rejected
 */
@Entity
@Table(name = "vehicles", indexes = {
    @Index(name = "idx_vehicle_tenant", columnList = "tenant_id"),
    @Index(name = "idx_vehicle_tenant_dealer", columnList = "tenant_id, dealer_id"),
    @Index(name = "idx_vehicle_tenant_status", columnList = "tenant_id, status"),
    @Index(name = "idx_vehicle_tenant_price", columnList = "tenant_id, price")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Tenant discriminator column for multi-tenancy support.
     * This field is mandatory and prevents cross-tenant data leakage.
     */
    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    /**
     * Foreign key reference to the owning Dealer.
     * Must belong to the same tenant as this vehicle.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dealer_id", nullable = false)
    private Dealer dealer;

    /**
     * Descriptive name or model of the vehicle.
     */
    @Column(name = "model", nullable = false, length = 255)
    private String model;

    /**
     * List price of the vehicle.
     * Must be a positive value.
     */
    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /**
     * Current availability status of the vehicle.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private VehicleStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = VehicleStatus.AVAILABLE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Checks if the vehicle is available for purchase.
     */
    public boolean isAvailable() {
        return VehicleStatus.AVAILABLE.equals(status);
    }

    /**
     * Marks the vehicle as sold.
     */
    public void markAsSold() {
        this.status = VehicleStatus.SOLD;
    }

    /**
     * Marks the vehicle as available.
     */
    public void markAsAvailable() {
        this.status = VehicleStatus.AVAILABLE;
    }
}