package com.smartpos.payment.repository;

import com.smartpos.payment.model.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundRepository extends JpaRepository<Refund, String> {
    List<Refund> findByIntentId(String intentId);
}
