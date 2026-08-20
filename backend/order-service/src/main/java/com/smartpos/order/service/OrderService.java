package com.smartpos.order.service;

import com.smartpos.order.dto.*;
import com.smartpos.order.exception.BadRequestException;
import com.smartpos.order.exception.ResourceNotFoundException;
import com.smartpos.order.model.Order;
import com.smartpos.order.model.OrderItem;
import com.smartpos.order.model.enums.*;
import com.smartpos.order.repository.OrderRepository;
import com.smartpos.order.event.OrderEventPublisher;
import com.smartpos.order.event.OrderCreatedEvent;
import com.smartpos.order.event.OrderStatusChangedEvent;
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
    private final OrderEventPublisher orderEventPublisher;

    public List<OrderResponse> getAllOrders(String channelStr, String statusStr, String priorityStr, String search) {
        OrderChannel channel = parseEnum(OrderChannel.class, channelStr);
        OrderStatus status = parseEnum(OrderStatus.class, statusStr);
        OrderPriority priority = parseEnum(OrderPriority.class, priorityStr);

        return orderRepository.findAll().stream()
                .filter(o -> channel == null || o.getChannel() == channel)
                .filter(o -> status == null || o.getStatus() == status)
                .filter(o -> priority == null || o.getPriority() == priority)
                .filter(o -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String s = search.toLowerCase();
                    boolean matchNum = o.getOrderNumber() != null && o.getOrderNumber().toLowerCase().contains(s);
                    boolean matchCust = o.getCustomerName() != null && o.getCustomerName().toLowerCase().contains(s);
                    return matchNum || matchCust;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private <T extends Enum<T>> T parseEnum(Class<T> enumClass, String value) {
        if (value == null || value.trim().isEmpty() || value.equalsIgnoreCase("all")) {
            return null;
        }
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (Exception e) {
            return null;
        }
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

        // Publish Kafka Event
        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(saved.getId())
                .orderNumber(saved.getOrderNumber())
                .tenantId("tenant-1") // default tenant if multi-tenancy not strictly enforced here
                .channel(saved.getChannel() != null ? saved.getChannel().name() : null)
                .tableNumber(saved.getTableNumber() != null ? String.valueOf(saved.getTableNumber()) : null)
                .customerName(saved.getCustomerName())
                .total(saved.getTotal())
                .createdAt(saved.getCreatedAt())
                .items(saved.getItems().stream().map(item -> OrderCreatedEvent.OrderItemEvent.builder()
                        .name(item.getName())
                        .quantity(item.getQuantity())
                        .category(item.getCategory())
                        .notes(item.getNotes())
                        .build()).collect(Collectors.toList()))
                .build();
        orderEventPublisher.publishOrderCreated(event);

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

        String previousStatus = order.getStatus() != null ? order.getStatus().name() : null;
        order.setStatus(newStatus);
        if (newStatus == OrderStatus.READY || newStatus == OrderStatus.COMPLETED) {
            order.setActualReadyTime(LocalDateTime.now());
        }
        if (request.getReason() != null) {
            order.setDelayReason(request.getReason());
        }

        Order saved = orderRepository.save(order);
        OrderResponse response = mapToResponse(saved);

        // Publish Kafka Event
        OrderStatusChangedEvent event = OrderStatusChangedEvent.builder()
                .orderId(saved.getId())
                .orderNumber(saved.getOrderNumber())
                .tenantId("tenant-1")
                .previousStatus(previousStatus)
                .newStatus(saved.getStatus().name())
                .changedAt(LocalDateTime.now())
                .build();
        orderEventPublisher.publishOrderStatusChanged(event);

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
