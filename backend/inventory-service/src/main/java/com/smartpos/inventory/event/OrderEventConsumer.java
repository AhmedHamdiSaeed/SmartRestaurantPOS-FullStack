package com.smartpos.inventory.event;

import com.smartpos.inventory.model.Ingredient;
import com.smartpos.inventory.model.RecipeItem;
import com.smartpos.inventory.model.StockMovement;
import com.smartpos.inventory.model.enums.StockMovementType;
import com.smartpos.inventory.repository.IngredientRepository;
import com.smartpos.inventory.repository.RecipeRepository;
import com.smartpos.inventory.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final StockMovementRepository stockMovementRepository;

    @KafkaListener(topics = "orders.paid", groupId = "inventory-service")
    @Transactional
    public void handleOrderPaid(OrderPaidEvent event) {
        log.info("Processing stock deduction for order: {}", event.getOrderId());
        for (OrderPaidEvent.OrderItemInfo item : event.getItems()) {
            recipeRepository.findByProductIdAndTenantId(item.getProductId(), event.getTenantId())
                .ifPresent(recipe -> {
                    for (RecipeItem ri : recipe.getItems()) {
                        deductStock(ri.getIngredient(), ri.getQuantity() * item.getQuantity(), event.getOrderId(), event.getTenantId());
                    }
                });
        }
    }

    private void deductStock(Ingredient ingredient, double quantity, String orderId, String tenantId) {
        double before = ingredient.getCurrentStock();
        double after = Math.max(0, before - quantity);
        ingredient.setCurrentStock(after);
        ingredientRepository.save(ingredient);
        
        StockMovement movement = StockMovement.builder()
            .tenantId(tenantId)
            .ingredient(ingredient)
            .type(StockMovementType.SALE)
            .quantity(-quantity)
            .quantityBefore(before)
            .quantityAfter(after)
            .referenceId(orderId)
            .referenceType("ORDER")
            .build();
        stockMovementRepository.save(movement);
        
        if (after <= ingredient.getMinimumStock() && ingredient.getMinimumStock() > 0) {
            log.warn("LOW STOCK ALERT: {} - current: {} {}, minimum: {} {}",
                ingredient.getName(), after, ingredient.getUnit(), ingredient.getMinimumStock(), ingredient.getUnit());
            // TODO: Publish LowStockEvent to Kafka for notification service
        }
    }
}
