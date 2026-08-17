package com.smartpos.order.service;

import com.smartpos.order.dto.OrderItemRequest;
import com.smartpos.order.dto.OrderRequest;
import com.smartpos.order.dto.OrderResponse;
import com.smartpos.order.dto.OrderStatusUpdateRequest;
import com.smartpos.order.event.OrderCreatedEvent;
import com.smartpos.order.event.OrderEventPublisher;
import com.smartpos.order.event.OrderStatusChangedEvent;
import com.smartpos.order.exception.BadRequestException;
import com.smartpos.order.exception.ResourceNotFoundException;
import com.smartpos.order.model.Order;
import com.smartpos.order.model.enums.OrderStatus;
import com.smartpos.order.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private OrderEventPublisher orderEventPublisher;

    @InjectMocks
    private OrderService orderService;

    private OrderRequest orderRequest;
    private Order order;

    @BeforeEach
    void setUp() {
        OrderItemRequest itemRequest = new OrderItemRequest();
        itemRequest.setName("Burger");
        itemRequest.setQuantity(2);
        itemRequest.setPrice(10.0);

        orderRequest = new OrderRequest();
        orderRequest.setCustomerName("Test User");
        orderRequest.setItems(List.of(itemRequest));

        order = new Order();
        order.setId(UUID.randomUUID().toString());
        order.setOrderNumber("ORD-123");
        order.setStatus(OrderStatus.RECEIVED);
        order.setItems(new ArrayList<>());
    }

    @Test
    void createOrder_shouldPersistAndPublishEvent() {
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(UUID.randomUUID().toString());
            return o;
        });

        OrderResponse response = orderService.createOrder(orderRequest);

        assertNotNull(response);
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(orderEventPublisher, times(1)).publishOrderCreated(any(OrderCreatedEvent.class));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/orders/new"), any(OrderResponse.class));
    }

    @Test
    void createOrder_shouldCalculateTaxCorrectly() {
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId("test-id");
            return o;
        });

        OrderResponse response = orderService.createOrder(orderRequest);

        // subtotal = 2 * 10 = 20
        // tax = 20 * 0.15 = 3.0
        // total = 23.0
        assertEquals(20.0, response.getSubtotal());
        assertEquals(3.0, response.getTax());
        assertEquals(23.0, response.getTotal());
    }

    @Test
    void updateStatus_shouldPersistAndPublishStatusChanged() {
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderStatusUpdateRequest request = new OrderStatusUpdateRequest();
        request.setStatus("PREPARING");

        OrderResponse response = orderService.updateStatus(order.getId(), request);

        assertEquals(OrderStatus.PREPARING, response.getStatus());
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(orderEventPublisher, times(1)).publishOrderStatusChanged(any(OrderStatusChangedEvent.class));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/orders/status"), any(OrderResponse.class));
    }

    @Test
    void updateStatus_withInvalidStatus_shouldThrow() {
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));

        OrderStatusUpdateRequest request = new OrderStatusUpdateRequest();
        request.setStatus("INVALID_STATUS");

        assertThrows(BadRequestException.class, () -> {
            orderService.updateStatus(order.getId(), request);
        });
    }

    @Test
    void getOrderById_withNonexistentId_shouldThrow() {
        when(orderRepository.findById("nonexistent")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            orderService.getOrderById("nonexistent");
        });
    }
}
