package com.inventory.module.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when an entity is not found within the current tenant's scope.
 * Results in HTTP 404 Not Found response.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class EntityNotFoundException extends RuntimeException {

    public EntityNotFoundException(String message) {
        super(message);
    }

    public EntityNotFoundException(String entityName, String id) {
        super(String.format("%s not found with ID: %s", entityName, id));
    }

    public EntityNotFoundException(String entityName, String fieldName, String value) {
        super(String.format("%s not found with %s: %s", entityName, fieldName, value));
    }
}