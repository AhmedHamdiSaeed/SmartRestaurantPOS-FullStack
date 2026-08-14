package com.smartpos.product.dto;

import com.smartpos.product.model.enums.ProductCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private String id;
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
}
