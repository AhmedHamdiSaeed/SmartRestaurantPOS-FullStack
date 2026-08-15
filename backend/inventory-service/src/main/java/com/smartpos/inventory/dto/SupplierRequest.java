package com.smartpos.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupplierRequest {
    @NotBlank
    private String name;
    
    private String contactName;
    
    private String contactEmail;
    
    private String contactPhone;
    
    private String address;
}
