package com.smartpos.kitchen.controller;

import com.smartpos.kitchen.dto.KitchenLoadResponse;
import com.smartpos.kitchen.model.KitchenStation;
import com.smartpos.kitchen.model.KitchenTicket;
import com.smartpos.kitchen.model.TicketStatus;
import com.smartpos.kitchen.service.KitchenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/kitchen")
@RequiredArgsConstructor
@Tag(name = "Kitchen", description = "Kitchen display and ticket management")
public class KitchenController {

    private final KitchenService kitchenService;

    @GetMapping("/load")
    @Operation(summary = "Get current kitchen load metrics")
    public ResponseEntity<KitchenLoadResponse> getKitchenLoad() {
        return ResponseEntity.ok(kitchenService.getKitchenLoad());
    }

    @GetMapping("/stations")
    @Operation(summary = "Get all kitchen stations")
    public ResponseEntity<List<KitchenStation>> getStations() {
        return ResponseEntity.ok(kitchenService.getStations());
    }

    @GetMapping("/tickets")
    @Operation(summary = "Get active kitchen tickets (NEW and PREPARING)")
    public ResponseEntity<List<KitchenTicket>> getActiveTickets(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantId) {
        return ResponseEntity.ok(kitchenService.getActiveTickets(tenantId));
    }

    @GetMapping("/tickets/{id}")
    @Operation(summary = "Get a kitchen ticket by ID")
    public ResponseEntity<KitchenTicket> getTicket(@PathVariable String id) {
        return ResponseEntity.ok(kitchenService.getTicketById(id));
    }

    @PatchMapping("/tickets/{id}/status")
    @Operation(summary = "Update kitchen ticket status")
    public ResponseEntity<KitchenTicket> updateTicketStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        TicketStatus newStatus = TicketStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(kitchenService.updateTicketStatus(id, newStatus));
    }
}
