package com.smartpos.order.controller;

import com.smartpos.order.dto.*;
import com.smartpos.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders(
            @RequestParam(required = false) String channel,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(orderService.getAllOrders(channel, status, priority, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> getStatusInfo(@PathVariable String id) {
        OrderResponse order = orderService.getOrderById(id);
        Map<String, Object> result = new HashMap<>();
        result.put("id", order.getId());
        result.put("orderNumber", order.getOrderNumber());
        result.put("status", order.getStatus());
        result.put("priority", order.getPriority());
        result.put("customerName", order.getCustomerName());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable String id, @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request));
    }

    @RequestMapping(value = "/{id}/priority", method = {RequestMethod.PATCH, RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<OrderResponse> updatePriority(@PathVariable String id, @Valid @RequestBody OrderPriorityUpdateRequest request) {
        return ResponseEntity.ok(orderService.updatePriority(id, request));
    }
}
