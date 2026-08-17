package com.smartpos.order.dto;

import lombok.Data;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
public class OrderRequest {
    private String channel;
    private String priority;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private Integer loyaltyPoints;
    private Integer tableNumber;
    private String deliveryAddress;
    private String notes;

    @NotEmpty
    private List<OrderItemRequest> items;
}
