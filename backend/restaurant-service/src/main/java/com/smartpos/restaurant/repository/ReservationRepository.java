package com.smartpos.restaurant.repository;

import com.smartpos.restaurant.model.Reservation;
import com.smartpos.restaurant.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, String> {
    List<Reservation> findByTenantIdOrderByReservationTimeAsc(String tenantId);
    List<Reservation> findByTableIdAndStatus(String tableId, ReservationStatus status);
}
