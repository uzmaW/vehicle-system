package com.inventory.module.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when the X-Tenant-Id header is missing from a request.
 * Results in HTTP 400 Bad Request response.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class MissingTenantHeaderException extends RuntimeException {

    private static final String DEFAULT_MESSAGE = "Required header 'X-Tenant-Id' is missing";

    public MissingTenantHeaderException() {
        super(DEFAULT_MESSAGE);
    }

    public MissingTenantHeaderException(String message) {
        super(message);
    }
}