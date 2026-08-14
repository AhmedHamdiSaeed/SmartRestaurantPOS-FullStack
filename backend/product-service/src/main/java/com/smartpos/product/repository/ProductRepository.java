package com.smartpos.product.repository;

import com.smartpos.product.model.Product;
import com.smartpos.product.model.enums.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByCategory(ProductCategory category);
    long countByCategory(ProductCategory category);
}
