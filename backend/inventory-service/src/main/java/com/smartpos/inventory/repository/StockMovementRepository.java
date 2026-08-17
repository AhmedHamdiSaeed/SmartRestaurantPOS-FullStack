package com.smartpos.inventory.repository;

import com.smartpos.inventory.model.StockMovement;
import com.smartpos.inventory.model.enums.StockMovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, String> {

    List<StockMovement> findByTenantIdAndIngredientIdOrderByCreatedAtDesc(String tenantId, String ingredientId);

    List<StockMovement> findByTenantIdAndTypeAndCreatedAtBetween(String tenantId, StockMovementType type, LocalDateTime from, LocalDateTime to);
}
