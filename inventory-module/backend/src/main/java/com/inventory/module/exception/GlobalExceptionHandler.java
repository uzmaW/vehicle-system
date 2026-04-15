package com.inventory.module.exception;

import com.inventory.module.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Global exception handler for the inventory module.
 * 
 * Translates domain and application exceptions into standardized HTTP responses
 * with consistent error structure for API consumers.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles missing X-Tenant-Id header.
     * Returns 400 Bad Request.
     */
    @ExceptionHandler(MissingTenantHeaderException.class)
    public ResponseEntity<ErrorResponse> handleMissingTenantHeader(MissingTenantHeaderException ex) {
        log.warn("Missing tenant header: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), "MISSING_TENANT_HEADER");
    }

    /**
     * Handles cross-tenant access attempts.
     * Returns 403 Forbidden.
     */
    @ExceptionHandler(CrossTenantAccessException.class)
    public ResponseEntity<ErrorResponse> handleCrossTenantAccess(CrossTenantAccessException ex) {
        log.error("Cross-tenant access attempt: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), "CROSS_TENANT_ACCESS");
    }

    /**
     * Handles entity not found within tenant scope.
     * Returns 404 Not Found.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {
        log.debug("Entity not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), "ENTITY_NOT_FOUND");
    }

    /**
     * Handles domain validation failures.
     * Returns 422 Unprocessable Entity with validation details.
     */
    @ExceptionHandler(DomainValidationException.class)
    public ResponseEntity<ErrorResponse> handleDomainValidation(DomainValidationException ex) {
        log.warn("Domain validation failed: {}", ex.getMessage());
        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
                .error(HttpStatus.UNPROCESSABLE_ENTITY.getReasonPhrase())
                .message(ex.getMessage())
                .errorCode("VALIDATION_ERROR")
                .validationErrors(ex.getValidationErrors())
                .build();
        return ResponseEntity.unprocessableEntity().body(response);
    }

    /**
     * Handles Bean Validation errors from @Valid annotations.
     * Returns 400 Bad Request with field-level error details.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> String.format("%s: %s", error.getField(), error.getDefaultMessage()))
                .collect(Collectors.toList());

        log.warn("Validation errors: {}", errors);
        
        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Validation failed")
                .errorCode("VALIDATION_ERROR")
                .validationErrors(errors)
                .build();
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handles SecurityException thrown by admin role checks.
     * Returns 403 Forbidden.
     */
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ErrorResponse> handleSecurityException(SecurityException ex) {
        log.warn("Security exception: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), "ACCESS_DENIED");
    }

    /**
     * Handles Spring Security AccessDeniedException.
     * Returns 403 Forbidden.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), "ACCESS_DENIED");
    }

    /**
     * Handles all other unexpected exceptions.
     * Returns 500 Internal Server Error.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An unexpected error occurred", "INTERNAL_ERROR");
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, String errorCode) {
        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .errorCode(errorCode)
                .build();
        return ResponseEntity.status(status).body(response);
    }

}