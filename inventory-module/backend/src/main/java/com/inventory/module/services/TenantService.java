package com.inventory.module.services;

import com.inventory.module.domain.SubscriptionType;
import com.inventory.module.domain.Tenant;
import com.inventory.module.domain.User;
import com.inventory.module.dto.PagedResponse;
import com.inventory.module.dto.TenantRegisterRequest;
import com.inventory.module.dto.TenantRegisterResponse;
import com.inventory.module.dto.TenantResponse;
import com.inventory.module.dto.UserResponse;
import com.inventory.module.repositories.TenantRepository;
import com.inventory.module.repositories.UserRepository;
import com.inventory.module.security.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for tenant management operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;

    /**
     * Register a new tenant and create the first TENANT_ADMIN user.
     *
     * @param request the registration request with admin user details
     * @return the registration response with tenant and admin user
     */
    @Transactional
    public TenantRegisterResponse registerTenant(TenantRegisterRequest request) {
        log.info("Registering new tenant: {}", request.getName());

        // Check if email already exists for tenant
        if (tenantRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Create new tenant
        Tenant tenant = Tenant.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .subscriptionType(request.getSubscriptionType() != null
                        ? request.getSubscriptionType()
                        : SubscriptionType.BASIC)
                .active(true) // Auto-activate for simplicity
                .build();

        tenant = tenantRepository.save(tenant);
        log.info("Tenant registered successfully with UUID: {}", tenant.getUuid());

        // Create first TENANT_ADMIN user for this tenant
        User adminUser = User.builder()
                .name(request.getAdminName())
                .email(request.getEmail()) // Admin uses tenant email
                .password(request.getAdminPassword())
                .tenantId(tenant.getUuid())
                .role(UserRole.TENANT_ADMIN)
                .active(true)
                .build();

        adminUser = userRepository.save(adminUser);
        log.info("First TENANT_ADMIN created for tenant: {}", tenant.getUuid());

        TenantResponse tenantResponse = TenantResponse.fromEntity(tenant);
        UserResponse userResponse = UserResponse.fromEntity(adminUser);

        return TenantRegisterResponse.builder()
                .tenant(tenantResponse)
                .adminUser(userResponse)
                .build();
    }

    /**
     * Get tenant by UUID.
     *
     * @param uuid the tenant UUID
     * @return the tenant response
     */
    @Transactional(readOnly = true)
    public TenantResponse getTenantByUuid(String uuid) {
        return tenantRepository.findByUuid(uuid)
                .map(TenantResponse::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + uuid));
    }

    /**
     * Check if tenant exists and is active.
     *
     * @param uuid the tenant UUID
     * @return true if tenant exists and is active
     */
    @Transactional(readOnly = true)
    public boolean isTenantActive(String uuid) {
        Optional<Tenant> tenant = tenantRepository.findByUuid(uuid);
        return tenant.map(Tenant::getActive).orElse(false);
    }

    /**
     * Validate tenant for API access.
     * Throws exception if tenant is invalid.
     *
     * @param uuid the tenant UUID
     */
    @Transactional(readOnly = true)
    public void validateTenant(String uuid) {
        Tenant tenant = tenantRepository.findByUuid(uuid)
                .orElseThrow(() -> new IllegalArgumentException("Invalid tenant: " + uuid));

        if (!Boolean.TRUE.equals(tenant.getActive())) {
            throw new IllegalArgumentException("Tenant is not active: " + uuid);
        }
    }

    /**
     * Get all tenants with pagination.
     *
     * @param page page number
     * @param size page size
     * @param sortBy field to sort by
     * @param sortDirection sort direction
     * @return paginated tenant list
     */
    @Transactional(readOnly = true)
    public PagedResponse<TenantResponse> getAllTenants(
            int page, int size, String sortBy, String sortDirection) {
        log.info("Fetching tenants - page: {}, size: {}, sortBy: {}, sortDir: {}",
                page, size, sortBy, sortDirection);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<Tenant> tenantPage = tenantRepository.findAll(pageRequest);

        List<TenantResponse> responses = tenantPage.getContent().stream()
                .map(TenantResponse::fromEntity)
                .toList();

        return PagedResponse.<TenantResponse>builder()
                .content(responses)
                .pageNumber(tenantPage.getNumber())
                .pageSize(tenantPage.getSize())
                .totalElements(tenantPage.getTotalElements())
                .totalPages(tenantPage.getTotalPages())
                .first(tenantPage.isFirst())
                .last(tenantPage.isLast())
                .empty(tenantPage.isEmpty())
                .build();
    }
}