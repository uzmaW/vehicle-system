package com.inventory.module.services;

import com.inventory.module.domain.User;
import com.inventory.module.dto.PagedResponse;
import com.inventory.module.dto.UserCreateRequest;
import com.inventory.module.dto.UserResponse;
import com.inventory.module.dto.UserUpdateRequest;
import com.inventory.module.repositories.UserRepository;
import com.inventory.module.security.TenantContext;
import com.inventory.module.security.UserContext;
import com.inventory.module.security.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for user management operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Create a new user.
     * GLOBAL_ADMIN can create users for any tenant.
     * STANDARD users create users for their own tenant.
     *
     * @param request the user creation request
     * @return the created user response
     */
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        log.info("Creating user with email: {}", request.getEmail());

        String targetTenantId = resolveTargetTenantId(request.getTenantId());

        // Check if email already exists in the tenant
        if (userRepository.existsByEmailAndTenantId(request.getEmail(), targetTenantId)) {
            throw new IllegalArgumentException("Email already exists in this tenant");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .tenantId(targetTenantId)
                .role(request.getRole() != null ? request.getRole() : UserRole.STANDARD)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        user = userRepository.save(user);
        log.info("User created successfully with UUID: {}", user.getUuid());

        return UserResponse.fromEntity(user);
    }

    /**
     * Get user by UUID.
     *
     * @param uuid the user UUID
     * @return the user response
     */
    @Transactional(readOnly = true)
    public UserResponse getUserByUuid(String uuid) {
        User user = findUserByUuid(uuid);
        validateUserAccess(user.getTenantId());
        return UserResponse.fromEntity(user);
    }

    /**
     * Get all users with pagination.
     * GLOBAL_ADMIN sees all users across all tenants.
     * STANDARD users see only users in their tenant.
     *
     * @param page page number
     * @param size page size
     * @param sortBy field to sort by
     * @param sortDirection sort direction
     * @return paginated user list
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(
            int page, int size, String sortBy, String sortDirection) {
        log.info("Fetching users - page: {}, size: {}, sortBy: {}, sortDir: {}",
                page, size, sortBy, sortDirection);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        PageRequest pageRequest = PageRequest.of(page, size, sort);

        Page<User> userPage;
        if (UserContext.isGlobalAdmin()) {
            // Global admin sees all users
            userPage = userRepository.findAll(pageRequest);
        } else {
            // Regular users see only their tenant's users
            String tenantId = TenantContext.getTenantId();
            userPage = userRepository.findByTenantId(tenantId, pageRequest);
        }

        List<UserResponse> responses = userPage.getContent().stream()
                .map(UserResponse::fromEntity)
                .toList();

        return PagedResponse.<UserResponse>builder()
                .content(responses)
                .pageNumber(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .first(userPage.isFirst())
                .last(userPage.isLast())
                .empty(userPage.isEmpty())
                .build();
    }

    /**
     * Update user by UUID.
     *
     * @param uuid the user UUID
     * @param request the update request
     * @return the updated user response
     */
    @Transactional
    public UserResponse updateUser(String uuid, UserUpdateRequest request) {
        log.info("Updating user with UUID: {}", uuid);

        User user = findUserByUuid(uuid);
        validateUserAccess(user.getTenantId());

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            // Check if new email already exists in the tenant
            if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmailAndTenantId(request.getEmail(), user.getTenantId())) {
                throw new IllegalArgumentException("Email already exists in this tenant");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            // Only GLOBAL_ADMIN can change roles
            if (!UserContext.isGlobalAdmin()) {
                throw new SecurityException("Only GLOBAL_ADMIN can change user roles");
            }
            user.setRole(request.getRole());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        user = userRepository.save(user);
        log.info("User updated successfully: {}", uuid);

        return UserResponse.fromEntity(user);
    }

    /**
     * Delete user by UUID (soft delete - sets active to false).
     *
     * @param uuid the user UUID
     */
    @Transactional
    public void deleteUser(String uuid) {
        log.info("Deleting user with UUID: {}", uuid);

        User user = findUserByUuid(uuid);
        validateUserAccess(user.getTenantId());

        user.setActive(false);
        userRepository.save(user);

        log.info("User soft-deleted successfully: {}", uuid);
    }

    // ========== Tenant-Scoped User Operations ==========

    /**
     * Get users by tenant ID with pagination.
     * Access validation is done at controller level.
     *
     * @param tenantUuid the tenant UUID
     * @param page page number
     * @param size page size
     * @param sortBy field to sort by
     * @param sortDirection sort direction
     * @return paginated user list
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsersByTenant(
            String tenantUuid, int page, int size, String sortBy, String sortDirection) {
        log.info("Fetching users for tenant: {} - page: {}, size: {}", tenantUuid, page, size);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        PageRequest pageRequest = PageRequest.of(page, size, sort);

        Page<User> userPage = userRepository.findByTenantId(tenantUuid, pageRequest);

        List<UserResponse> responses = userPage.getContent().stream()
                .map(UserResponse::fromEntity)
                .toList();

        return PagedResponse.<UserResponse>builder()
                .content(responses)
                .pageNumber(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .first(userPage.isFirst())
                .last(userPage.isLast())
                .empty(userPage.isEmpty())
                .build();
    }

    /**
     * Get user by UUID within a specific tenant.
     *
     * @param userUuid the user UUID
     * @param tenantUuid the tenant UUID
     * @return the user response
     */
    @Transactional(readOnly = true)
    public UserResponse getUserByUuidAndTenant(String userUuid, String tenantUuid) {
        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userUuid));

        if (!user.getTenantId().equals(tenantUuid)) {
            throw new IllegalArgumentException("User not found in specified tenant");
        }

        return UserResponse.fromEntity(user);
    }

    /**
     * Update user by UUID within a specific tenant.
     *
     * @param userUuid the user UUID
     * @param tenantUuid the tenant UUID
     * @param request the update request
     * @return the updated user response
     */
    @Transactional
    public UserResponse updateUserInTenant(String userUuid, String tenantUuid, UserUpdateRequest request) {
        log.info("Updating user: {} in tenant: {}", userUuid, tenantUuid);

        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userUuid));

        if (!user.getTenantId().equals(tenantUuid)) {
            throw new IllegalArgumentException("User not found in specified tenant");
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmailAndTenantId(request.getEmail(), tenantUuid)) {
                throw new IllegalArgumentException("Email already exists in this tenant");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null) {
            user.setPassword(request.getPassword());
        }
        if (request.getRole() != null) {
            // Only GLOBAL_ADMIN can change roles
            if (!UserContext.isGlobalAdmin()) {
                throw new SecurityException("Only GLOBAL_ADMIN can change user roles");
            }
            user.setRole(request.getRole());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        user = userRepository.save(user);
        log.info("User updated successfully: {}", userUuid);

        return UserResponse.fromEntity(user);
    }

    /**
     * Delete user by UUID within a specific tenant (soft delete).
     *
     * @param userUuid the user UUID
     * @param tenantUuid the tenant UUID
     */
    @Transactional
    public void deleteUserInTenant(String userUuid, String tenantUuid) {
        log.info("Deleting user: {} in tenant: {}", userUuid, tenantUuid);

        User user = userRepository.findByUuid(userUuid)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userUuid));

        if (!user.getTenantId().equals(tenantUuid)) {
            throw new IllegalArgumentException("User not found in specified tenant");
        }

        user.setActive(false);
        userRepository.save(user);

        log.info("User soft-deleted successfully: {}", userUuid);
    }

    /**
     * Find user entity by UUID.
     */
    private User findUserByUuid(String uuid) {
        return userRepository.findByUuid(uuid)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + uuid));
    }

    /**
     * Resolve the target tenant ID for user creation.
     * GLOBAL_ADMIN can specify a tenant ID.
     * Others use their own tenant ID.
     */
    private String resolveTargetTenantId(String requestedTenantId) {
        if (UserContext.isGlobalAdmin()) {
            if (requestedTenantId != null && !requestedTenantId.trim().isEmpty()) {
                return requestedTenantId;
            }
            // For global admin without tenant, they need to provide one
            throw new IllegalArgumentException("Tenant ID required for user creation");
        }
        return TenantContext.getTenantId();
    }

    /**
     * Validate that the current user can access data for the given tenant.
     */
    private void validateUserAccess(String userTenantId) {
        if (UserContext.isGlobalAdmin()) {
            return; // Global admin can access any tenant's users
        }
        String currentTenantId = TenantContext.getTenantId();
        if (!userTenantId.equals(currentTenantId)) {
            throw new SecurityException("Access denied: cannot access users from other tenants");
        }
    }
}
