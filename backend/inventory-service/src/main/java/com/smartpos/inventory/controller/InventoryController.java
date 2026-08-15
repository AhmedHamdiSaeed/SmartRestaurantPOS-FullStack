package com.smartpos.inventory.controller;

import com.smartpos.inventory.dto.*;
import com.smartpos.inventory.service.IngredientService;
import com.smartpos.inventory.service.RecipeService;
import com.smartpos.inventory.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Inventory, recipes, and supplier management")
public class InventoryController {

    private final IngredientService ingredientService;
    private final RecipeService recipeService;
    private final SupplierService supplierService;

    // ── Ingredients ──────────────────────────────────────────────────────────

    @GetMapping("/ingredients")
    @Operation(summary = "List all active ingredients for a tenant")
    public ResponseEntity<List<IngredientResponse>> getIngredients(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(ingredientService.getIngredients(tenantId));
    }

    @PostMapping("/ingredients")
    @Operation(summary = "Create a new ingredient")
    public ResponseEntity<IngredientResponse> createIngredient(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId,
            @Valid @RequestBody IngredientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ingredientService.createIngredient(tenantId, request));
    }

    @PutMapping("/ingredients/{id}")
    @Operation(summary = "Update an ingredient")
    public ResponseEntity<IngredientResponse> updateIngredient(
            @PathVariable String id,
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId,
            @Valid @RequestBody IngredientRequest request) {
        return ResponseEntity.ok(ingredientService.updateIngredient(id, tenantId, request));
    }

    @GetMapping("/ingredients/low-stock")
    @Operation(summary = "Get ingredients below minimum stock threshold")
    public ResponseEntity<List<IngredientResponse>> getLowStockIngredients(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(ingredientService.getLowStockIngredients(tenantId));
    }

    // ── Stock Movements ─────────────────────────────────────────────────────

    @PostMapping("/stock-movements")
    @Operation(summary = "Record a stock movement (purchase, waste, adjustment, etc.)")
    public ResponseEntity<StockMovementResponse> recordStockMovement(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId,
            @Valid @RequestBody StockMovementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ingredientService.recordStockMovement(tenantId, request));
    }

    @GetMapping("/stock-movements/{ingredientId}")
    @Operation(summary = "Get stock movement history for an ingredient")
    public ResponseEntity<List<StockMovementResponse>> getStockMovements(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId,
            @PathVariable String ingredientId) {
        return ResponseEntity.ok(ingredientService.getStockMovements(tenantId, ingredientId));
    }

    // ── Recipes ─────────────────────────────────────────────────────────────

    @GetMapping("/recipes")
    @Operation(summary = "List all recipes")
    public ResponseEntity<List<RecipeResponse>> listRecipes(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(recipeService.listRecipes(tenantId));
    }

    @PostMapping("/recipes")
    @Operation(summary = "Create a recipe for a product")
    public ResponseEntity<RecipeResponse> createRecipe(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId,
            @Valid @RequestBody RecipeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recipeService.createRecipe(tenantId, request));
    }

    @GetMapping("/recipes/{productId}")
    @Operation(summary = "Get recipe by product ID")
    public ResponseEntity<RecipeResponse> getRecipeByProduct(
            @PathVariable String productId,
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(recipeService.getRecipe(productId, tenantId));
    }

    // ── Suppliers ────────────────────────────────────────────────────────────

    @GetMapping("/suppliers")
    @Operation(summary = "List all active suppliers")
    public ResponseEntity<List<SupplierResponse>> getSuppliers(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(supplierService.getSuppliers(tenantId));
    }

    @PostMapping("/suppliers")
    @Operation(summary = "Create a new supplier")
    public ResponseEntity<SupplierResponse> createSupplier(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId,
            @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.createSupplier(tenantId, request));
    }
}
