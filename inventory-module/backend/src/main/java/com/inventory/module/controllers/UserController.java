package com.inventory.module.controllers;

import com.inventory.module.dto.PagedResponse;
import com.inventory.module.dto.UserCreateRequest;
import com.inventory.module.dto.UserResponse;
import com.inventory.module.dto.UserUpdateRequest;
import com.inventory.module.security.UserContext;
import com.inventory.module.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for user management operations.
 *
 * All endpoints require GLOBAL_ADMIN role.
 * These endpoints provide cross-tenant user management for platform administration.
 *
 * Endpoints:
 * - GET /api/users - List all users (paginated)
 * - GET /api/users/{uuid} - Get user by UUID
 * - POST /api/users - Create new user
 * - PUT /api/users/{uuid} - Update user
 * - DELETE /api/users/{uuid} - Delete user (soft delete)
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * List all users with pagination and sorting.
     *
     * GLOBAL_ADMIN sees all users across all tenants.
     * STANDARD users see only users in their own tenant.
     *
     * @param page page number (default 0)
     * @param size page size (default 20)
     * @param sortBy field to sort by (default createdAt)
     * @param sortDirection sort direction (default DESC)
     * @return paginated user list
     */
    @GetMapping
    public ResponseEntity<PagedResponse<UserResponse>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        log.info("GET /api/users - page: {}, size: {}, sortBy: {}, sortDir: {}",
                page, size, sortBy, sortDirection);

        // Role check - only GLOBAL_ADMIN can access user management
        if (!UserContext.isGlobalAdmin()) {
            log.warn("Non-admin user attempted to access user list");
            throw new SecurityException("Access denied: GLOBAL_ADMIN role required");
        }

        PagedResponse<UserResponse> response = userService.getAllUsers(
                page, size, sortBy, sortDirection);
        return ResponseEntity.ok(response);
    }

    /**
     * Get user by UUID.
     *
     * @param uuid the user UUID
     * @return the user information
     */
    @GetMapping("/{uuid}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String uuid) {
        log.info("GET /api/users/{}", uuid);

        // Role check - only GLOBAL_ADMIN can access
        if (!UserContext.isGlobalAdmin()) {
            log.warn("Non-admin user attempted to access user: {}", uuid);
            throw new SecurityException("Access denied: GLOBAL_ADMIN role required");
        }

        UserResponse response = userService.getUserByUuid(uuid);
        return ResponseEntity.ok(response);
    }

    /**
     * Create a new user.
     *
     * @param request the user creation request
     * @return the created user
     */
    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserCreateRequest request) {
        log.info("POST /api/users - Creating user with email: {}", request.getEmail());

        // Role check - only GLOBAL_ADMIN can create users
        if (!UserContext.isGlobalAdmin()) {
            log.warn("Non-admin user attempted to create user");
            throw new SecurityException("Access denied: GLOBAL_ADMIN role required");
        }

        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update user by UUID.
     *
     * @param uuid the user UUID
     * @param request the update request
     * @return the updated user
     */
    @PutMapping("/{uuid}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable String uuid,
            @Valid @RequestBody UserUpdateRequest request) {
        log.info("PUT /api/users/{}", uuid);

        // Role check - only GLOBAL_ADMIN can update users
        if (!UserContext.isGlobalAdmin()) {
            log.warn("Non-admin user attempted to update user: {}", uuid);
            throw new SecurityException("Access denied: GLOBAL_ADMIN role required");
        }

        UserResponse response = userService.updateUser(uuid, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete user by UUID (soft delete - sets active to false).
     *
     * @param uuid the user UUID
     * @return no content
     */
    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> deleteUser(@PathVariable String uuid) {
        log.info("DELETE /api/users/{}", uuid);

        // Role check - only GLOBAL_ADMIN can delete users
        if (!UserContext.isGlobalAdmin()) {
            log.warn("Non-admin user attempted to delete user: {}", uuid);
            throw new SecurityException("Access denied: GLOBAL_ADMIN role required");
        }

        userService.deleteUser(uuid);
        return ResponseEntity.noContent().build();
    }
}
