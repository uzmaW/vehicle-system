package com.inventory.module.controllers;

import com.inventory.module.dto.*;
import com.inventory.module.services.DealerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for Dealer management operations.
 * 
 * All endpoints require X-Tenant-Id header for tenant context.
 * Operations are automatically scoped to the current tenant.
 * 
 * Endpoints:
 * - POST /dealers - Create a new dealer
 * - GET /dealers/{id} - Get dealer by ID
 * - GET /dealers - List all dealers (paginated)
 * - PATCH /dealers/{id} - Update a dealer
 * - DELETE /dealers/{id} - Delete a dealer
 */
@Slf4j
@RestController
@RequestMapping("/dealers")
@RequiredArgsConstructor
public class DealerController {

    private final DealerService dealerService;

    /**
     * Creates a new dealer within the current tenant.
     * 
     * @param request the dealer creation request
     * @return the created dealer with 201 status
     */
    @PostMapping
    public ResponseEntity<DealerResponse> createDealer(
            @Valid @RequestBody DealerCreateRequest request) {
        log.info("POST /dealers - Creating dealer: {}", request.getEmail());
        
        DealerResponse response = dealerService.createDealer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves a dealer by ID within the current tenant.
     * 
     * @param id the dealer ID
     * @return the dealer response
     */
    @GetMapping("/{id}")
    public ResponseEntity<DealerResponse> getDealer(@PathVariable UUID id) {
        log.info("GET /dealers/{}", id);
        
        DealerResponse response = dealerService.getDealerById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Lists all dealers within the current tenant with pagination and sorting.
     * 
     * @param page page number (default 0)
     * @param size page size (default 20)
     * @param sortBy field to sort by (default createdAt)
     * @param sortDirection sort direction (default DESC)
     * @return paginated dealer list
     */
    @GetMapping
    public ResponseEntity<PagedResponse<DealerResponse>> listDealers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        log.info("GET /dealers - page: {}, size: {}, sortBy: {}, sortDir: {}", 
                page, size, sortBy, sortDirection);
        
        PagedResponse<DealerResponse> response = dealerService.getAllDealers(
                page, size, sortBy, sortDirection);
        return ResponseEntity.ok(response);
    }

    /**
     * Updates a dealer within the current tenant.
     * 
     * @param id the dealer ID
     * @param request the update request (partial updates supported)
     * @return the updated dealer
     */
    @PatchMapping("/{id}")
    public ResponseEntity<DealerResponse> updateDealer(
            @PathVariable UUID id,
            @Valid @RequestBody DealerUpdateRequest request) {
        log.info("PATCH /dealers/{} - Updating dealer", id);
        
        DealerResponse response = dealerService.updateDealer(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a dealer within the current tenant.
     * Associated vehicles will be cascade deleted.
     * 
     * @param id the dealer ID
     * @return 204 No Content on success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDealer(@PathVariable UUID id) {
        log.info("DELETE /dealers/{}", id);
        
        dealerService.deleteDealer(id);
        return ResponseEntity.noContent().build();
    }
}