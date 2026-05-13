package com.inventory.module.services;

import com.inventory.module.domain.Dealer;
import com.inventory.module.domain.SubscriptionType;
import com.inventory.module.dto.*;
import com.inventory.module.exception.DomainValidationException;
import com.inventory.module.exception.EntityNotFoundException;
import com.inventory.module.repositories.DealerRepository;
import com.inventory.module.repositories.VehicleRepository;
import com.inventory.module.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service layer for Dealer operations.
 * 
 * Implements business logic for dealer management including:
 * - CRUD operations with tenant scoping
 * - Validation of business rules
 * - Cross-tenant access prevention
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DealerService {

    private final DealerRepository dealerRepository;
    private final VehicleRepository vehicleRepository;

    /**
     * Creates a new dealer within the current tenant context.
     * 
     * @param request the dealer creation request
     * @return the created dealer response
     * @throws DomainValidationException if email already exists within tenant
     */
    @Transactional
    public DealerResponse createDealer(DealerCreateRequest request) {
        String tenantId = TenantContext.getTenantId();
        log.debug("Creating dealer for tenant: {}, email: {}", tenantId, request.getEmail());

        // Check email uniqueness within tenant
        if (dealerRepository.existsByEmail(request.getEmail())) {
            throw new DomainValidationException(
                "Dealer with email '" + request.getEmail() + "' already exists within this tenant");
        }

        Dealer dealer = Dealer.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .email(request.getEmail())
                .subscriptionType(request.getSubscriptionType())
                .build();

        Dealer savedDealer = dealerRepository.save(dealer);
        log.info("Created dealer: {} for tenant: {}", savedDealer.getId(), tenantId);

        return toDealerResponse(savedDealer);
    }

    /**
     * Retrieves a dealer by ID within the current tenant context.
     * 
     * @param id the dealer ID
     * @return the dealer response
     * @throws EntityNotFoundException if dealer not found within tenant
     */
    @Transactional(readOnly = true)
    public DealerResponse getDealerById(UUID id) {
        log.debug("Fetching dealer: {} for tenant: {}", id, TenantContext.getTenantId());
        
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dealer", id.toString()));
        
        return toDealerResponse(dealer);
    }

    /**
     * Retrieves all dealers within the current tenant context with pagination.
     * 
     * @param page the page number (0-indexed)
     * @param size the page size
     * @param sortBy the field to sort by
     * @param sortDirection the sort direction
     * @return paginated dealer responses
     */
    @Transactional(readOnly = true)
    public PagedResponse<DealerResponse> getAllDealers(int page, int size, 
                                                        String sortBy, String sortDirection) {
        log.debug("Listing dealers for tenant: {}", TenantContext.getTenantId());
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Dealer> dealerPage = dealerRepository.findAll(pageable);
        
        Page<DealerResponse> responsePage = dealerPage.map(this::toDealerResponse);
        return PagedResponse.from(responsePage);
    }

    /**
     * Updates an existing dealer within the current tenant context.
     * 
     * @param id the dealer ID
     * @param request the update request
     * @return the updated dealer response
     * @throws EntityNotFoundException if dealer not found
     * @throws DomainValidationException if email conflict
     */
    @Transactional
    public DealerResponse updateDealer(UUID id, DealerUpdateRequest request) {
        log.debug("Updating dealer: {} for tenant: {}", id, TenantContext.getTenantId());
        
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dealer", id.toString()));

        // Update fields if provided
        if (request.getName() != null) {
            dealer.setName(request.getName());
        }
        
        if (request.getEmail() != null) {
            // Check email uniqueness if changing
            if (!dealer.getEmail().equalsIgnoreCase(request.getEmail())) {
                if (dealerRepository.existsByEmail(request.getEmail())) {
                    throw new DomainValidationException(
                        "Dealer with email '" + request.getEmail() + "' already exists");
                }
                dealer.setEmail(request.getEmail());
            }
        }
        
        if (request.getSubscriptionType() != null) {
            dealer.setSubscriptionType(request.getSubscriptionType());
        }

        Dealer updatedDealer = dealerRepository.save(dealer);
        log.info("Updated dealer: {}", updatedDealer.getId());
        
        return toDealerResponse(updatedDealer);
    }

    /**
     * Deletes a dealer within the current tenant context.
     * Associated vehicles will be cascade deleted.
     * 
     * @param id the dealer ID
     * @throws EntityNotFoundException if dealer not found
     */
    @Transactional
    public void deleteDealer(UUID id) {
        log.debug("Deleting dealer: {} for tenant: {}", id, TenantContext.getTenantId());
        
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dealer", id.toString()));
        
        dealerRepository.delete(dealer);
        log.info("Deleted dealer: {} and associated vehicles", id);
    }

    /**
     * Gets the count of dealers by subscription type for the current tenant.
     * 
     * @return subscription count response
     */
    @Transactional(readOnly = true)
    public SubscriptionCountResponse getSubscriptionCounts() {
        String tenantId = TenantContext.getTenantId();
        log.debug("Counting dealers by subscription for tenant: {}", tenantId);
        
        long basicCount = dealerRepository.countBySubscriptionType(SubscriptionType.BASIC);
        long premiumCount = dealerRepository.countBySubscriptionType(SubscriptionType.PREMIUM);
        
        return SubscriptionCountResponse.of(basicCount, premiumCount);
    }

    /**
     * Gets global count of dealers by subscription type across ALL tenants.
     * Only available to GLOBAL_ADMIN users.
     * 
     * @return global subscription count response
     */
    @Transactional(readOnly = true)
    public SubscriptionCountResponse getGlobalSubscriptionCounts() {
        log.info("GLOBAL_ADMIN requesting global subscription counts");
        
        // Note: countBySubscriptionTypeGlobal uses native SQL which naturally
        // bypasses Hibernate filters, so tenant scoping is not applied.
        long basicCount = dealerRepository.countBySubscriptionTypeGlobal("BASIC");
        long premiumCount = dealerRepository.countBySubscriptionTypeGlobal("PREMIUM");
        
        return SubscriptionCountResponse.of(basicCount, premiumCount);
    }

    /**
     * Validates that a dealer exists and belongs to the current tenant.
     * 
     * @param dealerId the dealer ID to validate
     * @return the dealer entity
     * @throws EntityNotFoundException if not found
     */
    @Transactional(readOnly = true)
    public Dealer validateDealerExists(UUID dealerId) {
        return dealerRepository.findById(dealerId)
                .orElseThrow(() -> new EntityNotFoundException("Dealer", dealerId.toString()));
    }

    /**
     * Converts Dealer entity to response DTO.
     */
    private DealerResponse toDealerResponse(Dealer dealer) {
        long vehicleCount = vehicleRepository.countByDealerId(dealer.getId());
        
        return DealerResponse.builder()
                .id(dealer.getId())
                .name(dealer.getName())
                .email(dealer.getEmail())
                .subscriptionType(dealer.getSubscriptionType())
                .vehicleCount((int) vehicleCount)
                .createdAt(dealer.getCreatedAt())
                .updatedAt(dealer.getUpdatedAt())
                .build();
    }
}