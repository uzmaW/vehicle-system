package com.inventory.module.dto;

import com.inventory.module.domain.VehicleStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for updating an existing Vehicle.
 * 
 * All fields are optional - only provided fields will be updated.
 * Dealer ID can be changed to transfer vehicle between dealers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleUpdateRequest {

    private UUID dealerId;

    @Size(min = 1, max = 255, message = "Model must be between 1 and 255 characters")
    private String model;

    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    private VehicleStatus status;
}