package com.smartpos.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchResponse {
    private ProductResponse product;
    private int matchScore;
    private List<String> matchedFields;
    private String highlightedName;
}
