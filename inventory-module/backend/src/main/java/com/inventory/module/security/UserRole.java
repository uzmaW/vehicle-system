package com.inventory.module.security;

/**
 * Enumeration of user roles for role-based access control.
 * 
 * STANDARD - Regular tenant user with access only to their tenant's data
 * GLOBAL_ADMIN - Platform administrator with cross-tenant visibility
 */
public enum UserRole {
    STANDARD,
    GLOBAL_ADMIN
}