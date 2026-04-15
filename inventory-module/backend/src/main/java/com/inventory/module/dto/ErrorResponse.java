package com.inventory.module.dto;

import com.inventory.module.security.TenantContext;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standard error response structure for API errors.
 * 
 * Provides consistent error format across all endpoints:
 * - timestamp: When the error occurred
 * - status: HTTP status code
 * - error: HTTP status reason phrase
 * - message: Human-readable error description
 * - errorCode: Machine-readable error code for client-side handling
 * - validationErrors: Optional list of field-level validation errors
 * - tenantId: Current tenant context (for debugging)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String errorCode;
    private List<String> validationErrors;
    
    @Builder.Default
    private String tenantId = TenantContext.getTenantId();
}
