package com.smartpos.restaurant.controller;

import com.smartpos.restaurant.model.Reservation;
import com.smartpos.restaurant.model.ReservationStatus;
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
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
@Tag(name = "Table Reservations", description = "Table reservation management and seating")
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    @Operation(summary = "Get all table reservations")
    public ResponseEntity<List<Reservation>> getReservations(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(reservationService.getReservations(tenantId));
    }

    @PostMapping
    @Operation(summary = "Create a new table reservation")
    public ResponseEntity<Reservation> createReservation(
            @RequestParam String tableId,
            @RequestBody Reservation reservation) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.createReservation(reservation, tableId));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update reservation status (SEATED, CANCELLED, COMPLETED)")
    public ResponseEntity<Reservation> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        ReservationStatus status = ReservationStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(reservationService.updateReservationStatus(id, status));
    }
}
