package com.inventory.module.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TenantContextTest {

    @BeforeEach
    void setUp() {
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void setTenantId_shouldStoreTenantId() {
        TenantContext.setTenantId("tenant-123");

        assertEquals("tenant-123", TenantContext.getTenantId());
    }

    @Test
    void isSet_shouldReturnTrueWhenTenantIdIsSet() {
        TenantContext.setTenantId("tenant-123");

        assertTrue(TenantContext.isSet());
    }

    @Test
    void isSet_shouldReturnFalseWhenTenantIdIsNotSet() {
        assertFalse(TenantContext.isSet());
    }

    @Test
    void clear_shouldRemoveTenantId() {
        TenantContext.setTenantId("tenant-123");

        TenantContext.clear();

        assertNull(TenantContext.getTenantId());
        assertFalse(TenantContext.isSet());
    }

    @Test
    void setTenantId_shouldOverwritePreviousValue() {
        TenantContext.setTenantId("tenant-first");
        TenantContext.setTenantId("tenant-second");

        assertEquals("tenant-second", TenantContext.getTenantId());
    }
}