package com.inventory.module.controllers;

import com.inventory.module.domain.SubscriptionType;
import com.inventory.module.domain.VehicleStatus;
import com.inventory.module.dto.*;
import com.inventory.module.services.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * REST Controller for Vehicle inventory management operations.
 * 
 * All endpoints require X-Tenant-Id header for tenant context.
 * Operations are automatically scoped to the current tenant.
 * 
 * Endpoints:
 * - POST /vehicles - Create a new vehicle
 * - GET /vehicles/{id} - Get vehicle by ID
 * - GET /vehicles - List vehicles with filters (model, status, priceMin, priceMax, subscription)
 * - PATCH /vehicles/{id} - Update a vehicle
 * - DELETE /vehicles/{id} - Delete a vehicle
 */
@Slf4j
@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    /**
     * Creates a new vehicle for a dealer within the current tenant.
     * 
     * @param request the vehicle creation request
     * @return the created vehicle with 201 status
     */
    @PostMapping
    public ResponseEntity<VehicleResponse> createVehicle(
            @Valid @RequestBody VehicleCreateRequest request) {
        log.info("POST /vehicles - Creating vehicle for dealer: {}", request.getDealerId());
        
        VehicleResponse response = vehicleService.createVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves a vehicle by ID within the current tenant.
     * 
     * @param id the vehicle ID
     * @return the vehicle response
     */
    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getVehicle(@PathVariable UUID id) {
        log.info("GET /vehicles/{}", id);
        
        VehicleResponse response = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Lists vehicles with optional filtering, pagination, and sorting.
     * 
     * Filters:
     * - model: partial match on vehicle model name
     * - status: filter by vehicle status (AVAILABLE, SOLD)
     * - priceMin: minimum price (inclusive)
     * - priceMax: maximum price (inclusive)
     * - subscription: filter by dealer's subscription type (BASIC, PREMIUM)
     * 
     * Pagination:
     * - page: page number (default 0)
     * - size: page size (default 20)
     * - sortBy: field to sort by (default createdAt)
     * - sortDirection: sort direction (default DESC)
     * 
     * @param model model filter
     * @param status status filter
     * @param priceMin minimum price
     * @param priceMax maximum price
     * @param subscription dealer subscription filter
     * @param page page number
     * @param size page size
     * @param sortBy sort field
     * @param sortDirection sort direction
     * @return paginated vehicle list
     */
    @GetMapping
    public ResponseEntity<PagedResponse<VehicleResponse>> listVehicles(
            @RequestParam(required = false) String model,
            @RequestParam(required = false) VehicleStatus status,
            @RequestParam(required = false) BigDecimal priceMin,
            @RequestParam(required = false) BigDecimal priceMax,
            @RequestParam(required = false) SubscriptionType subscription,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        log.info("GET /vehicles - filters: model={}, status={}, priceMin={}, priceMax={}, subscription={}", 
                model, status, priceMin, priceMax, subscription);

        VehicleSearchRequest searchRequest = VehicleSearchRequest.builder()
                .model(model)
                .status(status)
                .priceMin(priceMin)
                .priceMax(priceMax)
                .subscription(subscription)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        PagedResponse<VehicleResponse> response = vehicleService.searchVehicles(searchRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Updates a vehicle within the current tenant.
     * 
     * @param id the vehicle ID
     * @param request the update request (partial updates supported)
     * @return the updated vehicle
     */
    @PatchMapping("/{id}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleUpdateRequest request) {
        log.info("PATCH /vehicles/{} - Updating vehicle", id);
        
        VehicleResponse response = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a vehicle within the current tenant.
     * 
     * @param id the vehicle ID
     * @return 204 No Content on success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable UUID id) {
        log.info("DELETE /vehicles/{}", id);
        
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}