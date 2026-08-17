package com.smartpos.inventory.repository;

import com.smartpos.inventory.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, String> {

    Optional<Recipe> findByProductIdAndTenantId(String productId, String tenantId);

    List<Recipe> findByTenantIdAndActiveTrue(String tenantId);
}
