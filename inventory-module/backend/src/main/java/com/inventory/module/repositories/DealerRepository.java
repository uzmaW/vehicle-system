package com.inventory.module.repositories;

import com.inventory.module.domain.Dealer;
import com.inventory.module.domain.SubscriptionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Dealer entity.
 * 
 * All queries automatically include tenant filtering through Hibernate filters.
 * The filter is enabled by the TenantAwareRepositoryAspect for all repository operations.
 */
@Repository
public interface DealerRepository extends JpaRepository<Dealer, UUID> {

    /**
     * Finds a dealer by ID within the current tenant context.
     * Note: Tenant filter is applied automatically.
     */
    Optional<Dealer> findById(UUID id);

    /**
     * Finds a dealer by email within the current tenant context.
     * Used for uniqueness validation.
     */
    Optional<Dealer> findByEmail(String email);

    /**
     * Checks if a dealer exists by email within the current tenant context.
     */
    boolean existsByEmail(String email);

    /**
     * Finds all dealers within the current tenant context with pagination.
     */
    Page<Dealer> findAll(Pageable pageable);

    /**
     * Counts dealers by subscription type within the current tenant context.
     */
    long countBySubscriptionType(SubscriptionType subscriptionType);

    /**
     * Counts all dealers within the current tenant context.
     */
    long count();

    /**
     * Global count of dealers by subscription type across ALL tenants.
     * Used by admin endpoints - bypasses tenant filter.
     */
    @Query(value = "SELECT COUNT(*) FROM dealers WHERE subscription_type = :subscriptionType", 
           nativeQuery = true)
    long countBySubscriptionTypeGlobal(@Param("subscriptionType") String subscriptionType);

    /**
     * Global count of all dealers across ALL tenants.
     * Used by admin endpoints - bypasses tenant filter.
     */
    @Query(value = "SELECT COUNT(*) FROM dealers", nativeQuery = true)
    long countGlobal();

    /**
     * Finds dealers by subscription type within current tenant.
     */
    Page<Dealer> findBySubscriptionType(SubscriptionType subscriptionType, Pageable pageable);
}