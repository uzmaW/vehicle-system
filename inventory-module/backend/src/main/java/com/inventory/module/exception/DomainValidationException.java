package com.inventory.module.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.ArrayList;
import java.util.List;

/**
 * Exception thrown when business rules or domain validation fails.
 * Results in HTTP 422 Unprocessable Entity response.
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class DomainValidationException extends RuntimeException {

    private final List<String> validationErrors;

    public DomainValidationException(String message) {
        super(message);
        this.validationErrors = new ArrayList<>();
        this.validationErrors.add(message);
    }

    public DomainValidationException(String message, List<String> errors) {
        super(message);
        this.validationErrors = errors != null ? errors : new ArrayList<>();
    }

    public DomainValidationException(List<String> errors) {
        super(String.join("; ", errors));
        this.validationErrors = errors;
    }

    public List<String> getValidationErrors() {
        return validationErrors;
    }
}