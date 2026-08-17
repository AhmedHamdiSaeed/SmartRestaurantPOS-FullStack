package com.smartpos.restaurant.controller;

import com.smartpos.restaurant.model.Customer;
import com.smartpos.restaurant.model.Reservation;
import com.smartpos.restaurant.model.ReservationStatus;
import com.smartpos.restaurant.service.CustomerService;
import com.smartpos.restaurant.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customers & Loyalty", description = "Customer profile management and loyalty program")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @Operation(summary = "Search customers by name or phone")
    public ResponseEntity<List<Customer>> searchCustomers(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(customerService.searchCustomers(q));
    }

    @PostMapping
    @Operation(summary = "Register a new customer profile")
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(customer));
    }

    @PostMapping("/{id}/loyalty")
    @Operation(summary = "Add loyalty points and record purchase spend")
    public ResponseEntity<Customer> addLoyaltyPoints(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        int points = ((Number) body.getOrDefault("points", 0)).intValue();
        double orderTotal = ((Number) body.getOrDefault("orderTotal", 0.0)).doubleValue();
        return ResponseEntity.ok(customerService.addLoyaltyPoints(id, points, orderTotal));
    }
}
