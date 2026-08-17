package com.smartpos.ai.provider;

public interface GeminiProviderPort {
    String generateInsight(String prompt);
    String analyzeSalesData(String salesSummary);
    String forecastInventoryNeeds(String inventoryStatus);
    String recommendMenuBundles(String popularItems);
}
