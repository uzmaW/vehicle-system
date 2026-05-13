package com.inventory.module.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserContextTest {

    @BeforeEach
    void setUp() {
        UserContext.clear();
    }

    @AfterEach
    void tearDown() {
        UserContext.clear();
    }

    @Test
    void setUserContext_shouldStoreUserIdAndRole() {
        UserContext.setUserContext("user-123", UserRole.TENANT_ADMIN);

        assertEquals("user-123", UserContext.getUserId());
        assertEquals(UserRole.TENANT_ADMIN, UserContext.getUserRole());
    }

    @Test
    void setUserContext_withEmail_shouldStoreAllFields() {
        UserContext.setUserContext("user-123", "test@example.com", UserRole.GLOBAL_ADMIN);

        assertEquals("user-123", UserContext.getUserId());
        assertEquals("test@example.com", UserContext.getEmail());
        assertEquals(UserRole.GLOBAL_ADMIN, UserContext.getUserRole());
    }

    @Test
    void getEmail_shouldReturnNullWhenNotSet() {
        UserContext.setUserContext("user-123", UserRole.STANDARD);

        assertNull(UserContext.getEmail());
    }

    @Test
    void clear_shouldRemoveAllContext() {
        UserContext.setUserContext("user-123", "test@example.com", UserRole.TENANT_ADMIN);

        UserContext.clear();

        assertNull(UserContext.getUserId());
        assertNull(UserContext.getEmail());
        assertNull(UserContext.getUserRole());
    }

    @Test
    void isGlobalAdmin_shouldReturnTrueForGlobalAdmin() {
        UserContext.setUserContext("user-1", UserRole.GLOBAL_ADMIN);

        assertTrue(UserContext.isGlobalAdmin());
        assertFalse(UserContext.isTenantAdmin());
    }

    @Test
    void isTenantAdmin_shouldReturnTrueForTenantAdmin() {
        UserContext.setUserContext("user-1", UserRole.TENANT_ADMIN);

        assertTrue(UserContext.isTenantAdmin());
        assertFalse(UserContext.isGlobalAdmin());
    }

    @Test
    void isTenantAdminOrAbove_shouldReturnTrueForBothAdminRoles() {
        UserContext.setUserContext("user-1", UserRole.GLOBAL_ADMIN);
        assertTrue(UserContext.isTenantAdminOrAbove());

        UserContext.setUserContext("user-2", UserRole.TENANT_ADMIN);
        assertTrue(UserContext.isTenantAdminOrAbove());

        UserContext.setUserContext("user-3", UserRole.STANDARD);
        assertFalse(UserContext.isTenantAdminOrAbove());
    }
}