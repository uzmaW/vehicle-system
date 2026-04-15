package com.inventory.module.controllers;

import com.inventory.module.dto.SubscriptionCountResponse;
import com.inventory.module.security.UserContext;
import com.inventory.module.services.DealerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Administrative operations.
 * 
 * All endpoints require GLOBAL_ADMIN role.
 * These endpoints provide cross-tenant visibility for platform administration.
 * 
 * Endpoints:
 * - GET /admin/dealers/countBySubscription - Get global subscription counts
 */
@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final DealerService dealerService;

    /**
     * Gets the count of dealers by subscription type across ALL tenants.
     * 
     * This endpoint provides a "God-eye view" for platform administrators
     * to monitor subscription distribution across the entire platform.
     * 
     * Response: { "basic": n, "premium": n }
     * 
     * IMPORTANT: These counts are OVERALL counts spanning all tenants,
     * not scoped to any single tenant. This is used for billing and
     * platform-wide capacity planning.
     * 
     * @return subscription counts across all tenants
     * @throws SecurityException if user is not GLOBAL_ADMIN
     */
    @GetMapping("/dealers/countBySubscription")
    public ResponseEntity<SubscriptionCountResponse> getDealerCountBySubscription() {
        log.info("GET /admin/dealers/countBySubscription - Requesting global counts");
        
        // Role check - only GLOBAL_ADMIN can access
        if (!UserContext.isGlobalAdmin()) {
            log.warn("Non-admin user attempted to access global subscription counts");
            throw new SecurityException("Access denied: GLOBAL_ADMIN role required");
        }
        
        SubscriptionCountResponse response = dealerService.getGlobalSubscriptionCounts();
        
        log.info("Global subscription counts - Basic: {}, Premium: {}", 
                response.getBasic(), response.getPremium());
        
        return ResponseEntity.ok(response);
    }
}