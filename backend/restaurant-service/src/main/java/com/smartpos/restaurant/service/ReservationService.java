package com.smartpos.restaurant.service;

import com.smartpos.restaurant.model.Reservation;
import com.smartpos.restaurant.model.ReservationStatus;
import com.smartpos.restaurant.model.RestaurantTable;
import com.smartpos.restaurant.model.TableStatus;
import com.smartpos.restaurant.repository.ReservationRepository;
import com.smartpos.restaurant.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;

    @Transactional
    public Reservation createReservation(Reservation reservation, String tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found: " + tableId));

        reservation.setTable(table);
        table.setStatus(TableStatus.RESERVED);
        tableRepository.save(table);

        return reservationRepository.save(reservation);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservations(String tenantId) {
        return reservationRepository.findByTenantIdOrderByReservationTimeAsc(tenantId);
    }

    @Transactional
    public Reservation updateReservationStatus(String reservationId, ReservationStatus newStatus) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found: " + reservationId));

        res.setStatus(newStatus);
        if (newStatus == ReservationStatus.SEATED) {
            res.getTable().setStatus(TableStatus.OCCUPIED);
        } else if (newStatus == ReservationStatus.CANCELLED || newStatus == ReservationStatus.COMPLETED) {
            res.getTable().setStatus(TableStatus.AVAILABLE);
        }
        tableRepository.save(res.getTable());
        return reservationRepository.save(res);
    }
}
