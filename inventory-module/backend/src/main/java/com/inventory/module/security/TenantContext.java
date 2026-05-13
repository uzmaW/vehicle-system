package com.inventory.module.security;

import org.slf4j.MDC;

/**
 * Thread-safe holder for the current tenant context.
 * 
 * Uses ThreadLocal to store the tenant ID for the duration of a request.
 * This ensures that the tenant identifier is accessible throughout the
 * application layers without needing to pass it explicitly through
 * method parameters.
 * 
 * Lifecycle Management:
 * 1. Extraction: Filter reads X-Tenant-Id header and validates existence
 * 2. Storage: ID is placed in ThreadLocal for request duration
 * 3. Propagation: ID is accessible to service and repository layers
 * 4. Cleanup: Context is cleared after request finishes
 */
public final class TenantContext {

    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();
    private static final String TENANT_ID_MDC_KEY = "tenantId";

    private TenantContext() {
        // Utility class - prevent instantiation
    }

    /**
     * Sets the tenant ID for the current request context.
     * Also adds it to MDC for logging purposes.
     * 
     * @param tenantId the tenant identifier to set
     */
    public static void setTenantId(String tenantId) {
        CURRENT_TENANT.set(tenantId);
        MDC.put(TENANT_ID_MDC_KEY, tenantId);
    }

    /**
     * Gets the tenant ID from the current request context.
     * 
     * @return the current tenant ID, or null if not set
     */
    public static String getTenantId() {
        return CURRENT_TENANT.get();
    }

    /**
     * Clears the tenant context for the current thread.
     * Must be called at the end of each request to prevent
     * context leakage between requests sharing the same thread.
     */
    public static void clear() {
        CURRENT_TENANT.remove();
        MDC.remove(TENANT_ID_MDC_KEY);
    }

    /**
     * Checks if a tenant context is currently set.
     * 
     * @return true if tenant ID is set, false otherwise
     */
    public static boolean isSet() {
        return CURRENT_TENANT.get() != null;
    }
}