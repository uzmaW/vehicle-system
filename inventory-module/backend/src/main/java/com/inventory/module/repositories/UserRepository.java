package com.inventory.module.repositories;

import com.inventory.module.domain.User;
import com.inventory.module.security.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by UUID.
     */
    Optional<User> findByUuid(String uuid);

    /**
     * Find user by email and tenant ID.
     */
    Optional<User> findByEmailAndTenantId(String email, String tenantId);

    /**
     * Find user by email (across all tenants - for login).
     */
    Optional<User> findByEmail(String email);

    /**
     * Find all users by tenant ID with pagination.
     */
    Page<User> findByTenantId(String tenantId, Pageable pageable);

    /**
     * Find all users by tenant ID.
     */
    List<User> findByTenantId(String tenantId);

    /**
     * Find all users by role.
     */
    List<User> findByRole(UserRole role);

    /**
     * Find all GLOBAL_ADMIN users.
     */
    List<User> findByRoleAndActive(UserRole role, Boolean active);

    /**
     * Check if user exists by email and tenant.
     */
    boolean existsByEmailAndTenantId(String email, String tenantId);

    /**
     * Count users by tenant.
     */
    long countByTenantId(String tenantId);

    /**
     * Check if user exists by UUID.
     */
    boolean existsByUuid(String uuid);
}