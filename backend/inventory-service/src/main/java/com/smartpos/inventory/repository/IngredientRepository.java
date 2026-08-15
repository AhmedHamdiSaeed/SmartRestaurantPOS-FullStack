package com.smartpos.inventory.repository;

import com.smartpos.inventory.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, String> {

    List<Ingredient> findByTenantIdAndActiveTrue(String tenantId);

    List<Ingredient> findByTenantIdAndCurrentStockLessThanEqualAndMinimumStockGreaterThan(String tenantId, double threshold, double minStock);

    List<Ingredient> findByTenantIdAndNameContainingIgnoreCase(String tenantId, String name);
}
