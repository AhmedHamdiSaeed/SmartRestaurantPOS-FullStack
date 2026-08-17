package com.smartpos.product.dto;

import com.smartpos.product.model.enums.ProductCategory;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ProductResponse {
    private String id;
    private String tenantId;
    private String name;
    private String nameAr;
    private String sku;
    private ProductCategory category;
    private Double price;
    private String description;
    private String imageUrl;
    private List<String> allergens;
    private Integer calories;
    private Boolean isAvailable;
    private Boolean isPopular;
    private Integer preparationTime;
    private List<String> tags;
    private Double rating;
    private Integer salesCount;
    private List<VariantResponse> variants;
    private List<ModifierResponse> modifiers;

    @Data
    @Builder
    public static class VariantResponse {
        private String id;
        private String name;
        private String nameAr;
        private Double priceAdjustment;
        private String sku;
        private Boolean isAvailable;
    }

    @Data
    @Builder
    public static class ModifierResponse {
        private String id;
        private String name;
        private String nameAr;
        private String groupName;
        private Double price;
        private Boolean isAvailable;
    }
}
