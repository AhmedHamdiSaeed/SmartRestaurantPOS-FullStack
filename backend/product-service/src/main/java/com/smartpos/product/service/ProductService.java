package com.smartpos.product.service;

import com.smartpos.product.dto.*;
import com.smartpos.product.model.Product;
import com.smartpos.product.model.enums.ProductCategory;
import com.smartpos.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ProductSearchResponse> searchProducts(String query, String categoryStr) {
        List<Product> products = productRepository.findAll();
        String q = query != null ? query.trim().toLowerCase() : "";

        ProductCategory catFilter = null;
        if (categoryStr != null && !categoryStr.equalsIgnoreCase("all")) {
            try { catFilter = ProductCategory.valueOf(categoryStr.toUpperCase()); } catch (Exception ignored) {}
        }

        List<ProductSearchResponse> results = new ArrayList<>();

        for (Product p : products) {
            if (catFilter != null && p.getCategory() != catFilter) continue;

            int score = 0;
            List<String> matched = new ArrayList<>();

            if (!q.isEmpty()) {
                if (p.getName() != null && p.getName().toLowerCase().contains(q)) {
                    score += 10;
                    matched.add("name");
                }
                if (p.getCategory() != null && p.getCategory().name().toLowerCase().contains(q)) {
                    score += 3;
                    matched.add("category");
                }
                if (p.getDescription() != null && p.getDescription().toLowerCase().contains(q)) {
                    score += 2;
                    matched.add("description");
                }
                if (p.getTags() != null && p.getTags().toLowerCase().contains(q)) {
                    score += 2;
                    matched.add("tags");
                }
                if (score == 0) continue;
            } else {
                score = 1;
            }

            if (Boolean.TRUE.equals(p.getIsPopular())) score += 2;

            String highlighted = p.getName();
            if (!q.isEmpty() && p.getName() != null) {
                highlighted = p.getName().replaceAll("(?i)" + q, "<mark>$0</mark>");
            }

            results.add(ProductSearchResponse.builder()
                    .product(mapToResponse(p))
                    .matchScore(score)
                    .matchedFields(matched)
                    .highlightedName(highlighted)
                    .build());
        }

        results.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        return results;
    }

    public List<CategoryResponse> getCategories() {
        Map<ProductCategory, String> icons = new EnumMap<>(ProductCategory.class);
        icons.put(ProductCategory.BURGERS, "🍔");
        icons.put(ProductCategory.SANDWICHES, "🥪");
        icons.put(ProductCategory.PIZZA, "🍕");
        icons.put(ProductCategory.PASTA, "🍝");
        icons.put(ProductCategory.SALADS, "🥗");
        icons.put(ProductCategory.SIDES, "🍟");
        icons.put(ProductCategory.DESSERTS, "🍰");
        icons.put(ProductCategory.DRINKS, "🥤");
        icons.put(ProductCategory.COMBOS, "📦");
        icons.put(ProductCategory.BREAKFAST, "🥞");

        List<CategoryResponse> list = new ArrayList<>();
        long total = productRepository.count();
        list.add(CategoryResponse.builder().value("all").label("All").icon("🍽️").count(total).build());

        for (ProductCategory cat : ProductCategory.values()) {
            long c = productRepository.countByCategory(cat);
            String label = cat.name().charAt(0) + cat.name().substring(1).toLowerCase();
            list.add(CategoryResponse.builder()
                    .value(cat.name().toLowerCase())
                    .label(label)
                    .icon(icons.getOrDefault(cat, "🍽️"))
                    .count(c)
                    .build());
        }
        return list;
    }

    public ProductResponse mapToResponse(Product p) {
        List<String> allergens = p.getAllergens() != null ? Arrays.asList(p.getAllergens().split(",")) : Collections.emptyList();
        List<String> tags = p.getTags() != null ? Arrays.asList(p.getTags().split(",")) : Collections.emptyList();

        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .nameAr(p.getNameAr())
                .sku(p.getSku())
                .category(p.getCategory())
                .price(p.getPrice())
                .description(p.getDescription())
                .imageUrl(p.getImageUrl())
                .allergens(allergens)
                .calories(p.getCalories())
                .isAvailable(p.getIsAvailable())
                .isPopular(p.getIsPopular())
                .preparationTime(p.getPreparationTime())
                .tags(tags)
                .rating(p.getRating())
                .salesCount(p.getSalesCount())
                .build();
    }
}
