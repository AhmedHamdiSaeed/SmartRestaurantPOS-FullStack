package com.smartpos.inventory.repository;

import com.smartpos.inventory.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, String> {

    List<PurchaseOrder> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}
