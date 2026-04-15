package com.inventory.module.services;

import com.inventory.module.domain.Dealer;
import com.inventory.module.domain.SubscriptionType;
import com.inventory.module.domain.Vehicle;
import com.inventory.module.domain.VehicleStatus;
import com.inventory.module.dto.*;
import com.inventory.module.exception.EntityNotFoundException;
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

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Service layer for Vehicle operations.
 * 
 * Implements business logic for vehicle inventory management including:
 * - CRUD operations with tenant scoping
 * - Complex filtering with subscription-based queries
 * - Cross-tenant access prevention
 * - Validation of dealer-vehicle relationships
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final DealerService dealerService;

    /**
     * Creates a new vehicle for a dealer within the current tenant context.
     * 
     * @param request the vehicle creation request
     * @return the created vehicle response
     * @throws EntityNotFoundException if dealer not found within tenant
     * @throws DomainValidationException if validation fails
     */
    @Transactional
    public VehicleResponse createVehicle(VehicleCreateRequest request) {
        String tenantId = TenantContext.getTenantId();
        log.debug("Creating vehicle for dealer: {} in tenant: {}", 
                 request.getDealerId(), tenantId);

        // Validate dealer exists within same tenant
        Dealer dealer = dealerService.validateDealerExists(request.getDealerId());

        Vehicle vehicle = Vehicle.builder()
                .tenantId(tenantId)
                .dealer(dealer)
                .model(request.getModel())
                .price(request.getPrice())
                .status(request.getStatus() != null ? request.getStatus() : VehicleStatus.AVAILABLE)
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        log.info("Created vehicle: {} for dealer: {} in tenant: {}", 
                savedVehicle.getId(), dealer.getId(), tenantId);

        return toVehicleResponse(savedVehicle);
    }

    /**
     * Retrieves a vehicle by ID within the current tenant context.
     * 
     * @param id the vehicle ID
     * @return the vehicle response
     * @throws EntityNotFoundException if vehicle not found
     */
    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(UUID id) {
        log.debug("Fetching vehicle: {} for tenant: {}", id, TenantContext.getTenantId());
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle", id.toString()));
        
        return toVehicleResponse(vehicle);
    }

    /**
     * Retrieves vehicles with optional filtering within the current tenant context.
     * 
     * Supports filtering by:
     * - model (partial match)
     * - status
     * - price range (priceMin, priceMax)
     * - dealer subscription type (subscription)
     * 
     * @param searchRequest the search parameters
     * @return paginated vehicle responses
     */
    @Transactional(readOnly = true)
    public PagedResponse<VehicleResponse> searchVehicles(VehicleSearchRequest searchRequest) {
        String tenantId = TenantContext.getTenantId();
        log.debug("Searching vehicles for tenant: {} with filters: {}", tenantId, searchRequest);

        Sort sort = Sort.by(Sort.Direction.fromString(searchRequest.getSortDirection()), 
                           searchRequest.getSortBy());
        Pageable pageable = PageRequest.of(searchRequest.getPage(), 
                                          searchRequest.getSize(), sort);

        Page<Vehicle> vehiclePage;

        // Use unified filter query when any filters are provided
        if (searchRequest.hasFilters()) {
            vehiclePage = vehicleRepository.findWithFilters(
                    tenantId,
                    searchRequest.getModel(),
                    searchRequest.getStatus(),
                    searchRequest.getPriceMin(),
                    searchRequest.getPriceMax(),
                    searchRequest.getSubscription(),
                    pageable);
        } else {
            // No filters - return all within tenant
            vehiclePage = vehicleRepository.findAll(pageable);
        }

        Page<VehicleResponse> responsePage = vehiclePage.map(this::toVehicleResponse);
        return PagedResponse.from(responsePage);
    }

    /**
     * Updates an existing vehicle within the current tenant context.
     * 
     * @param id the vehicle ID
     * @param request the update request
     * @return the updated vehicle response
     * @throws EntityNotFoundException if vehicle or new dealer not found
     */
    @Transactional
    public VehicleResponse updateVehicle(UUID id, VehicleUpdateRequest request) {
        log.debug("Updating vehicle: {} for tenant: {}", id, TenantContext.getTenantId());
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle", id.toString()));

        // Update dealer if provided
        if (request.getDealerId() != null && 
            !request.getDealerId().equals(vehicle.getDealer().getId())) {
            Dealer newDealer = dealerService.validateDealerExists(request.getDealerId());
            vehicle.setDealer(newDealer);
        }

        // Update other fields if provided
        if (request.getModel() != null) {
            vehicle.setModel(request.getModel());
        }
        
        if (request.getPrice() != null) {
            vehicle.setPrice(request.getPrice());
        }
        
        if (request.getStatus() != null) {
            vehicle.setStatus(request.getStatus());
        }

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        log.info("Updated vehicle: {}", updatedVehicle.getId());
        
        return toVehicleResponse(updatedVehicle);
    }

    /**
     * Deletes a vehicle within the current tenant context.
     * 
     * @param id the vehicle ID
     * @throws EntityNotFoundException if vehicle not found
     */
    @Transactional
    public void deleteVehicle(UUID id) {
        log.debug("Deleting vehicle: {} for tenant: {}", id, TenantContext.getTenantId());
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle", id.toString()));
        
        vehicleRepository.delete(vehicle);
        log.info("Deleted vehicle: {}", id);
    }

    /**
     * Marks a vehicle as sold.
     * 
     * @param id the vehicle ID
     * @return the updated vehicle response
     */
    @Transactional
    public VehicleResponse markAsSold(UUID id) {
        log.debug("Marking vehicle as sold: {}", id);
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle", id.toString()));
        
        vehicle.markAsSold();
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        
        log.info("Vehicle marked as sold: {}", id);
        return toVehicleResponse(updatedVehicle);
    }

    /**
     * Converts Vehicle entity to response DTO.
     */
    private VehicleResponse toVehicleResponse(Vehicle vehicle) {
        Dealer dealer = vehicle.getDealer();
        
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .dealerId(dealer != null ? dealer.getId() : null)
                .dealerName(dealer != null ? dealer.getName() : null)
                .dealerSubscriptionType(dealer != null ? dealer.getSubscriptionType() : null)
                .model(vehicle.getModel())
                .price(vehicle.getPrice())
                .status(vehicle.getStatus())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}