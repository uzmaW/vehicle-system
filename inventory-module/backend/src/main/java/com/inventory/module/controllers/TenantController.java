package com.inventory.module.controllers;

import com.inventory.module.dto.PagedResponse;
import com.inventory.module.dto.TenantRegisterRequest;
import com.inventory.module.dto.TenantResponse;
import com.inventory.module.services.TenantService;
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

    /**
     * Register a new tenant.
     *
     * @param request the registration request
     * @return the created tenant with UUID
     */
    @PostMapping("/register")
    public ResponseEntity<TenantResponse> registerTenant(
            @Valid @RequestBody TenantRegisterRequest request) {
        log.info("Received tenant registration request for: {}", request.getName());
        TenantResponse response = tenantService.registerTenant(request);
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
}