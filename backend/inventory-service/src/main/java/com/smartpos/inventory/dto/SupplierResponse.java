package com.smartpos.inventory.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SupplierResponse {
    private String id;
    private String tenantId;
    private String name;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private double rating;
    private boolean active;
    private LocalDateTime createdAt;
}
