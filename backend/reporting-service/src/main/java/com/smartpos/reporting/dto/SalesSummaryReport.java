package com.smartpos.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesSummaryReport {
    private String tenantId;
    private String period; // TODAY, THIS_WEEK, THIS_MONTH
    private double totalRevenue;
    private int totalOrders;
    private double averageTicketSize;
    private double taxCollected;
    private Map<String, Double> paymentMethodBreakdown;
    private List<CategorySalesDto> categoryBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySalesDto {
        private String category;
        private int itemQuantitySold;
        private double totalRevenue;
    }
}
