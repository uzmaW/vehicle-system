package com.inventory.module.security;

/**
 * Enumeration of user roles for role-based access control.
 *
 * STANDARD - Regular tenant user with access only to their tenant's data
 * TENANT_ADMIN - Tenant administrator with user management access within their tenant
 * GLOBAL_ADMIN - Platform administrator with cross-tenant visibility
 */
public enum UserRole {
    STANDARD,
    TENANT_ADMIN,
    GLOBAL_ADMIN
}