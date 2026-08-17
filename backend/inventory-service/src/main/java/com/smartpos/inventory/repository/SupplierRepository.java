package com.smartpos.inventory.repository;

import com.smartpos.inventory.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, String> {

    List<Supplier> findByTenantIdAndActiveTrue(String tenantId);
}
