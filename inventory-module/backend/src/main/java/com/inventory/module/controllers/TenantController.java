package com.inventory.module.controllers;

import com.inventory.module.dto.PagedResponse;
import com.inventory.module.dto.TenantRegisterRequest;
import com.inventory.module.dto.TenantRegisterResponse;
import com.inventory.module.dto.TenantResponse;
import com.inventory.module.dto.UserCreateRequest;
import com.inventory.module.dto.UserResponse;
import com.inventory.module.dto.UserUpdateRequest;
import com.inventory.module.security.TenantContext;
import com.inventory.module.security.UserContext;
import com.inventory.module.services.TenantService;
import com.inventory.module.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for tenant registration and management.
 * This endpoint does NOT require X-Tenant-Id header (public endpoint).
 */
@Slf4j
@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;
    private final UserService userService;

    /**
     * Register a new tenant with first TENANT_ADMIN user.
     *
     * @param request the registration request with admin user details
     * @return the created tenant and admin user
     */
    @PostMapping("/register")
    public ResponseEntity<TenantRegisterResponse> registerTenant(
            @Valid @RequestBody TenantRegisterRequest request) {
        log.info("Received tenant registration request for: {}", request.getName());
        TenantRegisterResponse response = tenantService.registerTenant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get tenant information by UUID.
     *
     * @param uuid the tenant UUID
     * @return the tenant information
     */
    @GetMapping("/{uuid}")
    public ResponseEntity<TenantResponse> getTenant(@PathVariable String uuid) {
        TenantResponse response = tenantService.getTenantByUuid(uuid);
        return ResponseEntity.ok(response);
    }

    /**
     * Check if tenant is active.
     *
     * @param uuid the tenant UUID
     * @return active status
     */
    @GetMapping("/{uuid}/status")
    public ResponseEntity<Boolean> checkTenantStatus(@PathVariable String uuid) {
        boolean isActive = tenantService.isTenantActive(uuid);
        return ResponseEntity.ok(isActive);
    }

    /**
     * List all tenants with pagination and sorting.
     *
     * @param page page number (default 0)
     * @param size page size (default 20)
     * @param sortBy field to sort by (default createdAt)
     * @param sortDirection sort direction (default DESC)
     * @return paginated tenant list
     */
    @GetMapping
    public ResponseEntity<PagedResponse<TenantResponse>> listTenants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        log.info("GET /api/tenants - page: {}, size: {}, sortBy: {}, sortDir: {}",
                page, size, sortBy, sortDirection);

        PagedResponse<TenantResponse> response = tenantService.getAllTenants(
                page, size, sortBy, sortDirection);
        return ResponseEntity.ok(response);
    }

    // ========== Tenant User Management Endpoints ==========

    /**
     * List all users for a specific tenant.
     * GLOBAL_ADMIN: can list users for any tenant.
     * TENANT_ADMIN: can list users for their own tenant.
     */
    @GetMapping("/{tenantUuid}/users")
    public ResponseEntity<PagedResponse<UserResponse>> listTenantUsers(
            @PathVariable String tenantUuid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        log.info("GET /api/tenants/{}/users - page: {}, size: {}", tenantUuid, page, size);
        validateTenantAccess(tenantUuid);
        PagedResponse<UserResponse> response = userService.getUsersByTenant(
                tenantUuid, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(response);
    }

    /**
     * Get user by UUID within a specific tenant.
     */
    @GetMapping("/{tenantUuid}/users/{userUuid}")
    public ResponseEntity<UserResponse> getTenantUser(
            @PathVariable String tenantUuid,
            @PathVariable String userUuid) {
        log.info("GET /api/tenants/{}/users/{}", tenantUuid, userUuid);
        validateTenantAccess(tenantUuid);
        UserResponse response = userService.getUserByUuidAndTenant(userUuid, tenantUuid);
        return ResponseEntity.ok(response);
    }

    /**
     * Create a new user for a specific tenant.
     */
    @PostMapping("/{tenantUuid}/users")
    public ResponseEntity<UserResponse> createTenantUser(
            @PathVariable String tenantUuid,
            @Valid @RequestBody UserCreateRequest request) {
        log.info("POST /api/tenants/{}/users - Creating user with email: {}", tenantUuid, request.getEmail());
        validateTenantAccess(tenantUuid);
        request.setTenantId(tenantUuid);
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update user by UUID within a specific tenant.
     */
    @PutMapping("/{tenantUuid}/users/{userUuid}")
    public ResponseEntity<UserResponse> updateTenantUser(
            @PathVariable String tenantUuid,
            @PathVariable String userUuid,
            @Valid @RequestBody UserUpdateRequest request) {
        log.info("PUT /api/tenants/{}/users/{}", tenantUuid, userUuid);
        validateTenantAccess(tenantUuid);
        UserResponse response = userService.updateUserInTenant(userUuid, tenantUuid, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete user by UUID within a specific tenant (soft delete).
     */
    @DeleteMapping("/{tenantUuid}/users/{userUuid}")
    public ResponseEntity<Void> deleteTenantUser(
            @PathVariable String tenantUuid,
            @PathVariable String userUuid) {
        log.info("DELETE /api/tenants/{}/users/{}", tenantUuid, userUuid);
        validateTenantAccess(tenantUuid);
        userService.deleteUserInTenant(userUuid, tenantUuid);
        return ResponseEntity.noContent().build();
    }

    /**
     * Validates that the current user can access the specified tenant.
     * GLOBAL_ADMIN: can access any tenant.
     * TENANT_ADMIN: can access their own tenant only.
     */
    private void validateTenantAccess(String tenantUuid) {
        if (UserContext.isGlobalAdmin()) {
            return;
        }
        if (UserContext.isTenantAdmin()) {
            String userTenantId = TenantContext.getTenantId();
            if (userTenantId != null && userTenantId.equals(tenantUuid)) {
                return;
            }
            throw new SecurityException("Access denied: TENANT_ADMIN can only manage users in their own tenant");
        }
        throw new SecurityException("Access denied: TENANT_ADMIN or GLOBAL_ADMIN role required");
    }
}