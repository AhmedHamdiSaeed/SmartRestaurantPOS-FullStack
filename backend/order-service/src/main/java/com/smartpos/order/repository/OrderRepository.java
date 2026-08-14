package com.smartpos.order.repository;

import com.smartpos.order.model.Order;
import com.smartpos.order.model.enums.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByChannel(OrderChannel channel);
    List<Order> findByPriority(OrderPriority priority);

    @Query("SELECT o FROM Order o WHERE " +
           "(:channel IS NULL OR o.channel = :channel) AND " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:priority IS NULL OR o.priority = :priority) AND " +
           "(:search IS NULL OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Order> searchOrders(@Param("channel") OrderChannel channel,
                            @Param("status") OrderStatus status,
                            @Param("priority") OrderPriority priority,
                            @Param("search") String search);
}
