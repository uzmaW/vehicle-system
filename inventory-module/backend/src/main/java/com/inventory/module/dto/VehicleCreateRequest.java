package com.inventory.module.dto;

import com.inventory.module.domain.VehicleStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for creating a new Vehicle.
 * 
 * Validation ensures:
 * - Dealer ID is required (must exist within same tenant)
 * - Model is required and within size limits
 * - Price is required and must be positive
 * - Status defaults to AVAILABLE if not provided
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleCreateRequest {

    @NotNull(message = "Dealer ID is required")
    private UUID dealerId;

    @NotBlank(message = "Vehicle model is required")
    @Size(min = 1, max = 255, message = "Model must be between 1 and 255 characters")
    private String model;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    private VehicleStatus status;
}