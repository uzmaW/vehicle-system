package com.inventory.module.repositories;

import com.inventory.module.domain.SubscriptionType;
import com.inventory.module.domain.Vehicle;
import com.inventory.module.domain.VehicleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Vehicle entity.
 * 
 * Extends JpaSpecificationExecutor for dynamic query building
 * to support complex filtering requirements.
 * 
 * All queries automatically include tenant filtering through Hibernate filters.
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID>, 
                                          JpaSpecificationExecutor<Vehicle> {

    /**
     * Finds a vehicle by ID within the current tenant context.
     */
    Optional<Vehicle> findById(UUID id);

    /**
     * Finds all vehicles within the current tenant context with pagination.
     */
    Page<Vehicle> findAll(Pageable pageable);

    /**
     * Counts vehicles by dealer ID within current tenant.
     */
    long countByDealerId(UUID dealerId);

    /**
     * Finds vehicles by dealer ID within current tenant.
     */
    Page<Vehicle> findByDealerId(UUID dealerId, Pageable pageable);

    /**
     * Finds vehicles by status within current tenant.
     */
    Page<Vehicle> findByStatus(VehicleStatus status, Pageable pageable);

    /**
     * Complex query to find vehicles by dealer's subscription type.
     * Maintains tenant isolation by checking tenant_id on both tables.
     * 
     * This query is used for GET /vehicles?subscription=PREMIUM
     */
    @Query("""
        SELECT v FROM Vehicle v 
        INNER JOIN v.dealer d 
        WHERE v.tenantId = :tenantId 
        AND d.tenantId = :tenantId 
        AND d.subscriptionType = :subscriptionType
        """)
    Page<Vehicle> findByDealerSubscriptionType(
            @Param("tenantId") String tenantId,
            @Param("subscriptionType") SubscriptionType subscriptionType,
            Pageable pageable);

    /**
     * Finds vehicles with price range filter within current tenant.
     */
    @Query("""
        SELECT v FROM Vehicle v 
        WHERE v.tenantId = :tenantId 
        AND (:priceMin IS NULL OR v.price >= :priceMin)
        AND (:priceMax IS NULL OR v.price <= :priceMax)
        """)
    Page<Vehicle> findByPriceRange(
            @Param("tenantId") String tenantId,
            @Param("priceMin") BigDecimal priceMin,
            @Param("priceMax") BigDecimal priceMax,
            Pageable pageable);

    /**
     * Finds vehicles with multiple filters within current tenant.
     */
    @Query("""
        SELECT v FROM Vehicle v 
        INNER JOIN v.dealer d
        WHERE v.tenantId = :tenantId 
        AND d.tenantId = :tenantId
        AND (:model IS NULL OR LOWER(v.model) LIKE LOWER(CONCAT('%', :model, '%')))
        AND (:status IS NULL OR v.status = :status)
        AND (:priceMin IS NULL OR v.price >= :priceMin)
        AND (:priceMax IS NULL OR v.price <= :priceMax)
        AND (:subscriptionType IS NULL OR d.subscriptionType = :subscriptionType)
        """)
    Page<Vehicle> findWithFilters(
            @Param("tenantId") String tenantId,
            @Param("model") String model,
            @Param("status") VehicleStatus status,
            @Param("priceMin") BigDecimal priceMin,
            @Param("priceMax") BigDecimal priceMax,
            @Param("subscriptionType") SubscriptionType subscriptionType,
            Pageable pageable);
}