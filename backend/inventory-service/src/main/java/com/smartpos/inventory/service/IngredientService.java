package com.smartpos.inventory.service;

import com.smartpos.inventory.dto.IngredientRequest;
import com.smartpos.inventory.dto.IngredientResponse;
import com.smartpos.inventory.dto.StockMovementRequest;
import com.smartpos.inventory.dto.StockMovementResponse;
import com.smartpos.inventory.model.Ingredient;
import com.smartpos.inventory.model.StockMovement;
import com.smartpos.inventory.repository.IngredientRepository;
import com.smartpos.inventory.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional
    public IngredientResponse createIngredient(String tenantId, IngredientRequest request) {
        Ingredient ingredient = Ingredient.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .nameAr(request.getNameAr())
                .sku(request.getSku())
                .unit(request.getUnit())
                .currentStock(request.getCurrentStock())
                .minimumStock(request.getMinimumStock())
                .costPerUnit(request.getCostPerUnit())
                .supplierId(request.getSupplierId())
                .build();
        
        ingredient = ingredientRepository.save(ingredient);
        return mapToResponse(ingredient);
    }

    @Transactional
    public IngredientResponse updateIngredient(String id, String tenantId, IngredientRequest request) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .filter(i -> i.getTenantId().equals(tenantId))
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));
        
        ingredient.setName(request.getName());
        ingredient.setNameAr(request.getNameAr());
        ingredient.setSku(request.getSku());
        ingredient.setUnit(request.getUnit());
        ingredient.setCurrentStock(request.getCurrentStock());
        ingredient.setMinimumStock(request.getMinimumStock());
        ingredient.setCostPerUnit(request.getCostPerUnit());
        ingredient.setSupplierId(request.getSupplierId());
        
        ingredient = ingredientRepository.save(ingredient);
        return mapToResponse(ingredient);
    }

    @Transactional(readOnly = true)
    public List<IngredientResponse> getIngredients(String tenantId) {
        return ingredientRepository.findByTenantIdAndActiveTrue(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IngredientResponse> getLowStockIngredients(String tenantId) {
        return ingredientRepository.findByTenantIdAndActiveTrue(tenantId).stream()
                .filter(i -> i.getCurrentStock() <= i.getMinimumStock() && i.getMinimumStock() > 0)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StockMovementResponse recordStockMovement(String tenantId, StockMovementRequest request) {
        Ingredient ingredient = ingredientRepository.findById(request.getIngredientId())
                .filter(i -> i.getTenantId().equals(tenantId))
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));
        
        double quantityBefore = ingredient.getCurrentStock();
        double quantityAfter = Math.max(0, quantityBefore + request.getQuantity());
        
        ingredient.setCurrentStock(quantityAfter);
        ingredientRepository.save(ingredient);
        
        StockMovement movement = StockMovement.builder()
                .tenantId(tenantId)
                .ingredient(ingredient)
                .type(request.getType())
                .quantity(request.getQuantity())
                .quantityBefore(quantityBefore)
                .quantityAfter(quantityAfter)
                .referenceId(request.getReferenceId())
                .referenceType(request.getReferenceType())
                .notes(request.getNotes())
                .performedBy(request.getPerformedBy())
                .build();
                
        movement = stockMovementRepository.save(movement);
        
        return StockMovementResponse.builder()
                .id(movement.getId())
                .tenantId(movement.getTenantId())
                .ingredientId(movement.getIngredient().getId())
                .type(movement.getType())
                .quantity(movement.getQuantity())
                .quantityBefore(movement.getQuantityBefore())
                .quantityAfter(movement.getQuantityAfter())
                .referenceId(movement.getReferenceId())
                .referenceType(movement.getReferenceType())
                .notes(movement.getNotes())
                .performedBy(movement.getPerformedBy())
                .createdAt(movement.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponse> getStockMovements(String tenantId, String ingredientId) {
        return stockMovementRepository.findByTenantIdAndIngredientIdOrderByCreatedAtDesc(tenantId, ingredientId).stream()
                .map(m -> StockMovementResponse.builder()
                        .id(m.getId())
                        .tenantId(m.getTenantId())
                        .ingredientId(m.getIngredient().getId())
                        .type(m.getType())
                        .quantity(m.getQuantity())
                        .quantityBefore(m.getQuantityBefore())
                        .quantityAfter(m.getQuantityAfter())
                        .referenceId(m.getReferenceId())
                        .referenceType(m.getReferenceType())
                        .notes(m.getNotes())
                        .performedBy(m.getPerformedBy())
                        .createdAt(m.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private IngredientResponse mapToResponse(Ingredient ingredient) {
        return IngredientResponse.builder()
                .id(ingredient.getId())
                .tenantId(ingredient.getTenantId())
                .name(ingredient.getName())
                .nameAr(ingredient.getNameAr())
                .sku(ingredient.getSku())
                .unit(ingredient.getUnit())
                .currentStock(ingredient.getCurrentStock())
                .minimumStock(ingredient.getMinimumStock())
                .costPerUnit(ingredient.getCostPerUnit())
                .supplierId(ingredient.getSupplierId())
                .active(ingredient.isActive())
                .createdAt(ingredient.getCreatedAt())
                .updatedAt(ingredient.getUpdatedAt())
                .isLowStock(ingredient.getCurrentStock() <= ingredient.getMinimumStock() && ingredient.getMinimumStock() > 0)
                .build();
    }
}
