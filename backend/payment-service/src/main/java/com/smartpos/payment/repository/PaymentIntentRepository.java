package com.smartpos.payment.repository;

import com.smartpos.payment.model.PaymentIntent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentIntentRepository extends JpaRepository<PaymentIntent, String> {
    Optional<PaymentIntent> findByOrderId(String orderId);
    List<PaymentIntent> findByTenantId(String tenantId);
    Optional<PaymentIntent> findByReferenceNumber(String referenceNumber);
}
