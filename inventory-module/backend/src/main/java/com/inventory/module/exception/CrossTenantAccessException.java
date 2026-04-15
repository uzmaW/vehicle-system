package com.inventory.module.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a user attempts to access data belonging to another tenant.
 * Results in HTTP 403 Forbidden response.
 * 
 * This is a security violation and should be logged for audit purposes.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class CrossTenantAccessException extends RuntimeException {

    private static final String DEFAULT_MESSAGE = "Access denied: Resource belongs to a different tenant";

    public CrossTenantAccessException() {
        super(DEFAULT_MESSAGE);
    }

    public CrossTenantAccessException(String message) {
        super(message);
    }

    public CrossTenantAccessException(String resourceType, String resourceId) {
        super(String.format("Access denied: %s with ID '%s' belongs to a different tenant", 
              resourceType, resourceId));
    }
}