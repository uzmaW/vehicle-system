package com.inventory.module.repositories;

import com.inventory.module.domain.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Tenant entity operations.
 */
@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {

    /**
     * Find tenant by UUID.
     */
    Optional<Tenant> findByUuid(String uuid);

    /**
     * Find tenant by email.
     */
    Optional<Tenant> findByEmail(String email);

    /**
     * Check if tenant exists by UUID.
     */
    boolean existsByUuid(String uuid);

    /**
     * Check if tenant exists by email.
     */
    boolean existsByEmail(String email);
}