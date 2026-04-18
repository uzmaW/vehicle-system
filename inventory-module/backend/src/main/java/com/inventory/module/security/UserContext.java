package com.inventory.module.security;

import org.slf4j.MDC;

/**
 * Thread-safe holder for the current user context including roles.
 * 
 * Works alongside TenantContext to provide complete security context
 * for the current request.
 */
public final class UserContext {

    private static final ThreadLocal<String> CURRENT_USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_USER_EMAIL = new ThreadLocal<>();
    private static final ThreadLocal<UserRole> CURRENT_USER_ROLE = new ThreadLocal<>();
    private static final String USER_ID_MDC_KEY = "userId";
    private static final String USER_EMAIL_MDC_KEY = "userEmail";
    private static final String USER_ROLE_MDC_KEY = "userRole";

    private UserContext() {
        // Utility class - prevent instantiation
    }

    /**
     * Sets the user context for the current request.
     *
     * @param userId the user identifier
     * @param role the user's role
     */
    public static void setUserContext(String userId, UserRole role) {
        CURRENT_USER_ID.set(userId);
        CURRENT_USER_ROLE.set(role);
        MDC.put(USER_ID_MDC_KEY, userId);
        MDC.put(USER_ROLE_MDC_KEY, role != null ? role.name() : null);
    }

    /**
     * Sets the user context with all details.
     *
     * @param userId the user identifier
     * @param email the user's email
     * @param role the user's role
     */
    public static void setUserContext(String userId, String email, UserRole role) {
        CURRENT_USER_ID.set(userId);
        CURRENT_USER_EMAIL.set(email);
        CURRENT_USER_ROLE.set(role);
        MDC.put(USER_ID_MDC_KEY, userId);
        MDC.put(USER_EMAIL_MDC_KEY, email);
        MDC.put(USER_ROLE_MDC_KEY, role != null ? role.name() : null);
    }

    /**
     * Gets the current user ID.
     *
     * @return the current user ID, or null if not set
     */
    public static String getUserId() {
        return CURRENT_USER_ID.get();
    }

    /**
     * Gets the current user's email.
     *
     * @return the current user email, or null if not set
     */
    public static String getEmail() {
        return CURRENT_USER_EMAIL.get();
    }

    /**
     * Gets the current user's role.
     *
     * @return the current user role, or null if not set
     */
    public static UserRole getUserRole() {
        return CURRENT_USER_ROLE.get();
    }

    /**
     * Checks if the current user is a global admin.
     *
     * @return true if the user has GLOBAL_ADMIN role
     */
    public static boolean isGlobalAdmin() {
        return UserRole.GLOBAL_ADMIN.equals(CURRENT_USER_ROLE.get());
    }

    /**
     * Checks if the current user is a tenant admin.
     *
     * @return true if the user has TENANT_ADMIN role
     */
    public static boolean isTenantAdmin() {
        return UserRole.TENANT_ADMIN.equals(CURRENT_USER_ROLE.get());
    }

    /**
     * Checks if the current user is a tenant admin OR global admin.
     *
     * @return true if the user has TENANT_ADMIN or GLOBAL_ADMIN role
     */
    public static boolean isTenantAdminOrAbove() {
        UserRole role = CURRENT_USER_ROLE.get();
        return UserRole.TENANT_ADMIN.equals(role) || UserRole.GLOBAL_ADMIN.equals(role);
    }

    /**
     * Clears the user context for the current thread.
     */
    public static void clear() {
        CURRENT_USER_ID.remove();
        CURRENT_USER_EMAIL.remove();
        CURRENT_USER_ROLE.remove();
        MDC.remove(USER_ID_MDC_KEY);
        MDC.remove(USER_EMAIL_MDC_KEY);
        MDC.remove(USER_ROLE_MDC_KEY);
    }
}