package com.smartpos.order.service;

import com.smartpos.order.dto.*;
import com.smartpos.order.exception.BadRequestException;
import com.smartpos.order.exception.ResourceNotFoundException;
import com.smartpos.order.model.Order;
import com.smartpos.order.model.OrderItem;
import com.smartpos.order.model.enums.*;
import com.smartpos.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<OrderResponse> getAllOrders(String channelStr, String statusStr, String priorityStr, String search) {
        OrderChannel channel = null;
        OrderStatus status = null;
        OrderPriority priority = null;

        if (channelStr != null && !channelStr.equalsIgnoreCase("all")) {
            try { channel = OrderChannel.valueOf(channelStr.toUpperCase()); } catch (Exception ignored) {}
        }
        if (statusStr != null && !statusStr.equalsIgnoreCase("all")) {
            try { status = OrderStatus.valueOf(statusStr.toUpperCase()); } catch (Exception ignored) {}
        }
        if (priorityStr != null && !priorityStr.equalsIgnoreCase("all")) {
            try { priority = OrderPriority.valueOf(priorityStr.toUpperCase()); } catch (Exception ignored) {}
        }

        return orderRepository.searchOrders(channel, status, priority, search)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public OrderResponse getOrderById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        OrderChannel channel = OrderChannel.WALKIN;
        if (request.getChannel() != null) {
            try { channel = OrderChannel.valueOf(request.getChannel().toUpperCase()); } catch (Exception ignored) {}
        }

        OrderPriority priority = OrderPriority.NORMAL;
        if (request.getPriority() != null) {
            try { priority = OrderPriority.valueOf(request.getPriority().toUpperCase()); } catch (Exception ignored) {}
        }

        String orderNum = "ORD-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Order order = Order.builder()
                .orderNumber(orderNum)
                .channel(channel)
                .status(OrderStatus.RECEIVED)
                .priority(priority)
                .customerName(request.getCustomerName() != null ? request.getCustomerName() : "Guest")
                .customerPhone(request.getCustomerPhone())
                .customerAddress(request.getCustomerAddress())
                .loyaltyPoints(request.getLoyaltyPoints() != null ? request.getLoyaltyPoints() : 0)
                .tableNumber(request.getTableNumber())
                .deliveryAddress(request.getDeliveryAddress())
                .notes(request.getNotes())
                .estimatedReadyTime(LocalDateTime.now().plusMinutes(15))
                .items(new ArrayList<>())
                .build();

        double subtotal = 0;
        for (OrderItemRequest itemReq : request.getItems()) {
            OrderItem item = OrderItem.builder()
                    .name(itemReq.getName())
                    .quantity(itemReq.getQuantity())
                    .price(itemReq.getPrice())
                    .notes(itemReq.getNotes())
                    .allergens(itemReq.getAllergens())
                    .category(itemReq.getCategory() != null ? itemReq.getCategory() : "general")
                    .order(order)
                    .build();
            order.getItems().add(item);
            subtotal += itemReq.getPrice() * itemReq.getQuantity();
        }

        double tax = subtotal * 0.15;
        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setTotal(subtotal + tax);

        Order saved = orderRepository.save(order);
        OrderResponse response = mapToResponse(saved);

        try {
            messagingTemplate.convertAndSend("/topic/orders/new", response);
        } catch (Exception ignored) {}

        return response;
    }

    @Transactional
    public OrderResponse updateStatus(String id, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid status: " + request.getStatus());
        }

        order.setStatus(newStatus);
        if (newStatus == OrderStatus.READY || newStatus == OrderStatus.COMPLETED) {
            order.setActualReadyTime(LocalDateTime.now());
        }
        if (request.getReason() != null) {
            order.setDelayReason(request.getReason());
        }

        Order saved = orderRepository.save(order);
        OrderResponse response = mapToResponse(saved);

        try {
            messagingTemplate.convertAndSend("/topic/orders/status", response);
        } catch (Exception ignored) {}

        return response;
    }

    @Transactional
    public OrderResponse updatePriority(String id, OrderPriorityUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        OrderPriority newPriority;
        try {
            newPriority = OrderPriority.valueOf(request.getPriority().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid priority: " + request.getPriority());
        }

        order.setPriority(newPriority);
        Order saved = orderRepository.save(order);
        OrderResponse response = mapToResponse(saved);

        try {
            messagingTemplate.convertAndSend("/topic/orders/priority", response);
        } catch (Exception ignored) {}

        return response;
    }

    public OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item ->
                OrderItemResponse.builder()
                        .id(item.getId())
                        .name(item.getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .notes(item.getNotes())
                        .allergens(item.getAllergens())
                        .category(item.getCategory())
                        .build()
        ).collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .channel(order.getChannel())
                .status(order.getStatus())
                .priority(order.getPriority())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .customerAddress(order.getCustomerAddress())
                .loyaltyPoints(order.getLoyaltyPoints())
                .tableNumber(order.getTableNumber())
                .deliveryAddress(order.getDeliveryAddress())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .total(order.getTotal())
                .isDelayed(order.getIsDelayed())
                .delayReason(order.getDelayReason())
                .notes(order.getNotes())
                .estimatedReadyTime(order.getEstimatedReadyTime())
                .actualReadyTime(order.getActualReadyTime())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemResponses)
                .build();
    }
}
