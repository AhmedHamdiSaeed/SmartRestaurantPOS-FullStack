package com.smartpos.product.dto;

import com.smartpos.product.model.enums.ProductCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    @NotBlank
    private String name;
    private String nameAr;
    @NotBlank
    private String sku;
    @NotNull
    private ProductCategory category;
    @NotNull @PositiveOrZero
    private Double price;
    private String description;
    private String imageUrl;
    private String allergens;
    private Integer calories;
    private Boolean isAvailable;
    private Boolean isPopular;
    private Integer preparationTime;
    private String tags;
    private List<VariantDto> variants;
    private List<ModifierDto> modifiers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantDto {
        private String name;
        private String nameAr;
        private Double priceAdjustment;
        private String sku;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModifierDto {
        private String name;
        private String nameAr;
        private String groupName;
        private Double price;
    }
}
