package com.smartpos.inventory.service;

import com.smartpos.inventory.dto.IngredientRequest;
import com.smartpos.inventory.dto.IngredientResponse;
import com.smartpos.inventory.dto.StockMovementRequest;
import com.smartpos.inventory.dto.StockMovementResponse;
import com.smartpos.inventory.model.Ingredient;
import com.smartpos.inventory.model.StockMovement;
import com.smartpos.inventory.model.enums.StockMovementType;
import com.smartpos.inventory.repository.IngredientRepository;
import com.smartpos.inventory.repository.StockMovementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IngredientServiceTest {

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @InjectMocks
    private IngredientService ingredientService;

    private Ingredient testIngredient;

    @BeforeEach
    void setUp() {
        testIngredient = Ingredient.builder()
                .id("ing-1")
                .tenantId("tenant-1")
                .name("Mozzarella Cheese")
                .unit("KG")
                .currentStock(10.0)
                .minimumStock(2.0)
                .costPerUnit(15.0)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("createIngredient — Should persist and return mapped response")
    void createIngredient_shouldPersistAndReturn() {
        IngredientRequest req = IngredientRequest.builder()
                .name("Mozzarella Cheese")
                .unit("KG")
                .currentStock(10.0)
                .minimumStock(2.0)
                .costPerUnit(15.0)
                .build();

        when(ingredientRepository.save(any(Ingredient.class))).thenReturn(testIngredient);

        IngredientResponse res = ingredientService.createIngredient("tenant-1", req);

        assertNotNull(res);
        assertEquals("Mozzarella Cheese", res.getName());
        assertEquals(10.0, res.getCurrentStock());
        assertFalse(res.isLowStock());
        verify(ingredientRepository).save(any(Ingredient.class));
    }

    @Test
    @DisplayName("getLowStockIngredients — Should return ingredients at or below threshold")
    void getLowStockIngredients_shouldFilterCorrectly() {
        Ingredient lowStock = Ingredient.builder()
                .id("ing-2")
                .tenantId("tenant-1")
                .name("Tomato Sauce")
                .unit("LITER")
                .currentStock(1.0)
                .minimumStock(3.0)
                .active(true)
                .build();

        when(ingredientRepository.findByTenantIdAndActiveTrue("tenant-1"))
                .thenReturn(List.of(testIngredient, lowStock));

        List<IngredientResponse> lowStockList = ingredientService.getLowStockIngredients("tenant-1");

        assertEquals(1, lowStockList.size());
        assertEquals("Tomato Sauce", lowStockList.get(0).getName());
        assertTrue(lowStockList.get(0).isLowStock());
    }

    @Test
    @DisplayName("recordStockMovement — Should update current stock and save movement")
    void recordStockMovement_shouldUpdateStock() {
        StockMovementRequest req = StockMovementRequest.builder()
                .ingredientId("ing-1")
                .type(StockMovementType.PURCHASE)
                .quantity(5.0)
                .referenceId("po-100")
                .referenceType("PURCHASE_ORDER")
                .performedBy("user-1")
                .build();

        StockMovement savedMovement = StockMovement.builder()
                .id("sm-1")
                .tenantId("tenant-1")
                .ingredient(testIngredient)
                .type(StockMovementType.PURCHASE)
                .quantity(5.0)
                .quantityBefore(10.0)
                .quantityAfter(15.0)
                .referenceId("po-100")
                .referenceType("PURCHASE_ORDER")
                .performedBy("user-1")
                .build();

        when(ingredientRepository.findById("ing-1")).thenReturn(Optional.of(testIngredient));
        when(stockMovementRepository.save(any(StockMovement.class))).thenReturn(savedMovement);

        StockMovementResponse res = ingredientService.recordStockMovement("tenant-1", req);

        assertNotNull(res);
        assertEquals(15.0, res.getQuantityAfter());
        assertEquals(15.0, testIngredient.getCurrentStock());
        verify(ingredientRepository).save(testIngredient);
        verify(stockMovementRepository).save(any(StockMovement.class));
    }
}
