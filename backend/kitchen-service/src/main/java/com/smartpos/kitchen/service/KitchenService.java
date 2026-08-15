package com.smartpos.kitchen.service;

import com.smartpos.kitchen.dto.KitchenLoadResponse;
import com.smartpos.kitchen.model.KitchenStation;
import com.smartpos.kitchen.model.KitchenTicket;
import com.smartpos.kitchen.model.TicketStatus;
import com.smartpos.kitchen.model.enums.StationStatus;
import com.smartpos.kitchen.repository.KitchenStationRepository;
import com.smartpos.kitchen.repository.KitchenTicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class KitchenService {

    private final KitchenStationRepository stationRepository;
    private final KitchenTicketRepository ticketRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    // ── Station methods (existing) ──────────────────────────────────────────

    public KitchenLoadResponse getKitchenLoad() {
        List<KitchenStation> stations = stationRepository.findAll();
        int totalLoad = 0;
        int totalActive = 0;

        for (KitchenStation s : stations) {
            totalLoad += s.getCurrentLoad() != null ? s.getCurrentLoad() : 0;
            totalActive += s.getActiveOrders() != null ? s.getActiveOrders() : 0;
        }

        int overall = stations.isEmpty() ? 0 : Math.round((float) totalLoad / stations.size());
        String alertLevel = "green";
        if (overall >= 90) alertLevel = "red";
        else if (overall >= 75) alertLevel = "orange";
        else if (overall >= 60) alertLevel = "yellow";

        double estimatedDelay = overall > 60 ? (overall - 60) * 0.5 : 0.0;

        return KitchenLoadResponse.builder()
                .overallLoad(overall)
                .stations(stations)
                .queueDepth(totalActive)
                .estimatedDelay(estimatedDelay)
                .alertLevel(alertLevel)
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    public List<KitchenStation> getStations() {
        return stationRepository.findAll();
    }

    @Scheduled(fixedRate = 5000)
    public void simulateLoadChanges() {
        List<KitchenStation> stations = stationRepository.findAll();
        if (stations.isEmpty()) return;

        for (KitchenStation s : stations) {
            int delta = random.nextInt(11) - 5; // -5 to +5
            int newLoad = Math.max(10, Math.min(95, (s.getCurrentLoad() != null ? s.getCurrentLoad() : 50) + delta));
            s.setCurrentLoad(newLoad);

            if (newLoad >= 85) s.setStatus(StationStatus.OVERLOADED);
            else if (newLoad >= 65) s.setStatus(StationStatus.BUSY);
            else s.setStatus(StationStatus.NORMAL);

            stationRepository.save(s);
        }

        try {
            messagingTemplate.convertAndSend("/topic/kitchen/load", getKitchenLoad());
        } catch (Exception ignored) {}
    }

    // ── Ticket methods (new — Kafka-driven) ─────────────────────────────────

    public List<KitchenTicket> getActiveTickets(String tenantId) {
        List<TicketStatus> activeStatuses = List.of(TicketStatus.NEW, TicketStatus.PREPARING);
        if (tenantId != null && !tenantId.isBlank()) {
            return ticketRepository.findByTenantIdAndStatusInOrderByCreatedAtAsc(tenantId, activeStatuses);
        }
        return ticketRepository.findByStatusInOrderByCreatedAtAsc(activeStatuses);
    }

    @Transactional
    public KitchenTicket updateTicketStatus(String ticketId, TicketStatus newStatus) {
        KitchenTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Kitchen ticket not found: " + ticketId));

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.PREPARING && ticket.getStartedAt() == null) {
            ticket.setStartedAt(LocalDateTime.now());
        }
        if (newStatus == TicketStatus.READY || newStatus == TicketStatus.SERVED) {
            ticket.setCompletedAt(LocalDateTime.now());
        }

        KitchenTicket saved = ticketRepository.save(ticket);

        log.info("Kitchen ticket {} status changed: {} → {}", ticketId, oldStatus, newStatus);

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", saved.getId());
            payload.put("orderNumber", saved.getOrderNumber());
            payload.put("tableNumber", saved.getTableNumber());
            payload.put("previousStatus", oldStatus.name());
            payload.put("newStatus", newStatus.name());
            payload.put("itemCount", saved.getItems().size());
            messagingTemplate.convertAndSend("/topic/kitchen/tickets/status", payload);
        } catch (Exception e) {
            log.warn("Could not broadcast ticket status via WebSocket: {}", e.getMessage());
        }

        return saved;
    }

    public KitchenTicket getTicketById(String ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Kitchen ticket not found: " + ticketId));
    }
}
