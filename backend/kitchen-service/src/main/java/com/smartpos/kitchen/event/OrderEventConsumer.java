package com.smartpos.kitchen.event;

import com.smartpos.kitchen.model.KitchenTicket;
import com.smartpos.kitchen.model.KitchenTicketItem;
import com.smartpos.kitchen.model.TicketStatus;
import com.smartpos.kitchen.repository.KitchenTicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final KitchenTicketRepository kitchenTicketRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(
        topics = "orders.created",
        groupId = "kitchen-service",
        containerFactory = "kafkaListenerContainerFactory"
    )
    @Transactional
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Kitchen received OrderCreatedEvent for order: {}", event.getOrderNumber());

        if (kitchenTicketRepository.findByOrderId(event.getOrderId()).isPresent()) {
            log.warn("Ticket already exists for order {}, skipping", event.getOrderId());
            return;
        }

        KitchenTicket ticket = KitchenTicket.builder()
            .orderId(event.getOrderId())
            .orderNumber(event.getOrderNumber())
            .tenantId(event.getTenantId())
            .tableNumber(event.getTableNumber())
            .channel(event.getChannel())
            .customerName(event.getCustomerName())
            .status(TicketStatus.NEW)
            .build();

        List<KitchenTicketItem> items = event.getItems().stream()
            .map(i -> KitchenTicketItem.builder()
                .ticket(ticket)
                .name(i.getName())
                .quantity(i.getQuantity())
                .category(i.getCategory())
                .notes(i.getNotes())
                .build())
            .collect(Collectors.toList());

        ticket.setItems(items);
        KitchenTicket saved = kitchenTicketRepository.save(ticket);

        log.info("Created kitchen ticket {} for order {}", saved.getId(), saved.getOrderNumber());

        try {
            messagingTemplate.convertAndSend("/topic/kitchen/tickets/new", toSummary(saved));
        } catch (Exception e) {
            log.warn("Could not broadcast new kitchen ticket via WebSocket: {}", e.getMessage());
        }
    }

    private Object toSummary(KitchenTicket ticket) {
        return new java.util.HashMap<String, Object>() {{
            put("id", ticket.getId());
            put("orderNumber", ticket.getOrderNumber());
            put("tableNumber", ticket.getTableNumber());
            put("status", ticket.getStatus().name());
            put("itemCount", ticket.getItems().size());
            put("createdAt", ticket.getCreatedAt() != null ? ticket.getCreatedAt().toString() : null);
        }};
    }
}
