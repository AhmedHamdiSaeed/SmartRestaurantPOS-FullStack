package com.smartpos.kitchen.repository;

import com.smartpos.kitchen.model.KitchenTicket;
import com.smartpos.kitchen.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface KitchenTicketRepository extends JpaRepository<KitchenTicket, String> {
    List<KitchenTicket> findByTenantIdAndStatusInOrderByCreatedAtAsc(String tenantId, List<TicketStatus> statuses);
    List<KitchenTicket> findByStatusInOrderByCreatedAtAsc(List<TicketStatus> statuses);
    Optional<KitchenTicket> findByOrderId(String orderId);
}
