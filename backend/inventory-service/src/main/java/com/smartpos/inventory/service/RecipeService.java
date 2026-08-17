package com.smartpos.inventory.service;

import com.smartpos.inventory.dto.RecipeItemRequest;
import com.smartpos.inventory.dto.RecipeRequest;
import com.smartpos.inventory.dto.RecipeResponse;
import com.smartpos.inventory.model.Ingredient;
import com.smartpos.inventory.model.Recipe;
import com.smartpos.inventory.model.RecipeItem;
import com.smartpos.inventory.repository.IngredientRepository;
import com.smartpos.inventory.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;

    @Transactional
    public RecipeResponse createRecipe(String tenantId, RecipeRequest request) {
        Recipe recipe = Recipe.builder()
                .tenantId(tenantId)
                .productId(request.getProductId())
                .productName(request.getProductName())
                .build();

        List<RecipeItem> items = request.getItems().stream()
                .map(ri -> {
                    Ingredient ingredient = ingredientRepository.findById(ri.getIngredientId())
                            .orElseThrow(() -> new RuntimeException("Ingredient not found: " + ri.getIngredientId()));
                    return RecipeItem.builder()
                            .recipe(recipe)
                            .ingredient(ingredient)
                            .quantity(ri.getQuantity())
                            .unit(ri.getUnit())
                            .build();
                })
                .collect(Collectors.toList());

        recipe.setItems(items);
        Recipe saved = recipeRepository.save(recipe);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public RecipeResponse getRecipe(String productId, String tenantId) {
        Recipe recipe = recipeRepository.findByProductIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new RuntimeException("Recipe not found for product: " + productId));
        return mapToResponse(recipe);
    }

    @Transactional(readOnly = true)
    public List<RecipeResponse> listRecipes(String tenantId) {
        return recipeRepository.findByTenantIdAndActiveTrue(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public double calculateProductCost(String productId, String tenantId) {
        Recipe recipe = recipeRepository.findByProductIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new RuntimeException("Recipe not found for product: " + productId));
        return recipe.getItems().stream()
                .mapToDouble(ri -> ri.getIngredient().getCostPerUnit() * ri.getQuantity())
                .sum();
    }

    private RecipeResponse mapToResponse(Recipe recipe) {
        List<RecipeResponse.RecipeItemResponse> items = recipe.getItems().stream()
                .map(ri -> RecipeResponse.RecipeItemResponse.builder()
                        .ingredientId(ri.getIngredient().getId())
                        .ingredientName(ri.getIngredient().getName())
                        .quantity(ri.getQuantity())
                        .unit(ri.getUnit())
                        .build())
                .collect(Collectors.toList());

        return RecipeResponse.builder()
                .id(recipe.getId())
                .productId(recipe.getProductId())
                .productName(recipe.getProductName())
                .items(items)
                .active(recipe.isActive())
                .createdAt(recipe.getCreatedAt())
                .build();
    }
}
