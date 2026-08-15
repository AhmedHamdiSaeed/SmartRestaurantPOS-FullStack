package com.smartpos.product.service;

import com.smartpos.product.dto.*;
import com.smartpos.product.model.Product;
import com.smartpos.product.model.ProductModifier;
import com.smartpos.product.model.ProductVariant;
import com.smartpos.product.model.enums.ProductCategory;
import com.smartpos.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'all'")
    public List<ProductResponse> getAllProducts() {
        log.info("Fetching all products from DB (cache miss)");
        return productRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(String id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return mapToResponse(p);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse createProduct(String tenantId, ProductRequest request) {
        Product product = Product.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .nameAr(request.getNameAr())
                .sku(request.getSku())
                .category(request.getCategory())
                .price(request.getPrice())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .allergens(request.getAllergens())
                .calories(request.getCalories())
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .isPopular(request.getIsPopular() != null ? request.getIsPopular() : false)
                .preparationTime(request.getPreparationTime())
                .tags(request.getTags())
                .rating(5.0)
                .salesCount(0)
                .build();

        if (request.getVariants() != null) {
            List<ProductVariant> variants = request.getVariants().stream()
                    .map(v -> ProductVariant.builder()
                            .product(product)
                            .name(v.getName())
                            .nameAr(v.getNameAr())
                            .priceAdjustment(v.getPriceAdjustment())
                            .sku(v.getSku())
                            .isAvailable(true)
                            .build())
                    .collect(Collectors.toList());
            product.setVariants(variants);
        }

        if (request.getModifiers() != null) {
            List<ProductModifier> modifiers = request.getModifiers().stream()
                    .map(m -> ProductModifier.builder()
                            .product(product)
                            .name(m.getName())
                            .nameAr(m.getNameAr())
                            .groupName(m.getGroupName())
                            .price(m.getPrice())
                            .isAvailable(true)
                            .build())
                    .collect(Collectors.toList());
            product.setModifiers(modifiers);
        }

        Product saved = productRepository.save(product);
        log.info("Created product: {} (ID: {})", saved.getName(), saved.getId());
        return mapToResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse updateProduct(String id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setName(request.getName());
        product.setNameAr(request.getNameAr());
        product.setSku(request.getSku());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setAllergens(request.getAllergens());
        product.setCalories(request.getCalories());
        if (request.getIsAvailable() != null) product.setIsAvailable(request.getIsAvailable());
        if (request.getIsPopular() != null) product.setIsPopular(request.getIsPopular());
        product.setPreparationTime(request.getPreparationTime());
        product.setTags(request.getTags());

        Product saved = productRepository.save(product);
        log.info("Updated product: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
        log.info("Deleted product: {}", id);
    }

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
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

        List<ProductResponse.VariantResponse> variants = p.getVariants() == null ? Collections.emptyList() :
                p.getVariants().stream().map(v -> ProductResponse.VariantResponse.builder()
                        .id(v.getId())
                        .name(v.getName())
                        .nameAr(v.getNameAr())
                        .priceAdjustment(v.getPriceAdjustment())
                        .sku(v.getSku())
                        .isAvailable(v.getIsAvailable())
                        .build()).collect(Collectors.toList());

        List<ProductResponse.ModifierResponse> modifiers = p.getModifiers() == null ? Collections.emptyList() :
                p.getModifiers().stream().map(m -> ProductResponse.ModifierResponse.builder()
                        .id(m.getId())
                        .name(m.getName())
                        .nameAr(m.getNameAr())
                        .groupName(m.getGroupName())
                        .price(m.getPrice())
                        .isAvailable(m.getIsAvailable())
                        .build()).collect(Collectors.toList());

        return ProductResponse.builder()
                .id(p.getId())
                .tenantId(p.getTenantId())
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
                .variants(variants)
                .modifiers(modifiers)
                .build();
    }
}
