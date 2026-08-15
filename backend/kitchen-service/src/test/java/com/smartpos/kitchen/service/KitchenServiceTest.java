package com.smartpos.kitchen.service;

import com.smartpos.kitchen.model.KitchenTicket;
import com.smartpos.kitchen.model.TicketStatus;
import com.smartpos.kitchen.repository.KitchenStationRepository;
import com.smartpos.kitchen.repository.KitchenTicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KitchenServiceTest {

    @Mock
    private KitchenStationRepository stationRepository;

    @Mock
    private KitchenTicketRepository ticketRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private KitchenService kitchenService;

    private KitchenTicket testTicket;

    @BeforeEach
    void setUp() {
        testTicket = KitchenTicket.builder()
                .id("ticket-1")
                .orderId("order-123")
                .orderNumber("ORD-1001")
                .tenantId("tenant-1")
                .tableNumber("T5")
                .status(TicketStatus.NEW)
                .items(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("getActiveTickets — Should query active statuses")
    void getActiveTickets_shouldReturnNewAndPreparing() {
        when(ticketRepository.findByTenantIdAndStatusInOrderByCreatedAtAsc(eq("tenant-1"), anyList()))
                .thenReturn(List.of(testTicket));

        List<KitchenTicket> tickets = kitchenService.getActiveTickets("tenant-1");

        assertEquals(1, tickets.size());
        assertEquals("ORD-1001", tickets.get(0).getOrderNumber());
    }

    @Test
    @DisplayName("updateTicketStatus — Should update status and set timestamps")
    void updateTicketStatus_shouldSetStartedAtOnPreparing() {
        when(ticketRepository.findById("ticket-1")).thenReturn(Optional.of(testTicket));
        when(ticketRepository.save(any(KitchenTicket.class))).thenAnswer(i -> i.getArgument(0));

        KitchenTicket updated = kitchenService.updateTicketStatus("ticket-1", TicketStatus.PREPARING);

        assertEquals(TicketStatus.PREPARING, updated.getStatus());
        assertNotNull(updated.getStartedAt());
        verify(messagingTemplate).convertAndSend(eq("/topic/kitchen/tickets/status"), anyMap());
    }

    @Test
    @DisplayName("updateTicketStatus — Nonexistent ticket should throw exception")
    void updateTicketStatus_nonexistentTicket_shouldThrow() {
        when(ticketRepository.findById("invalid")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> 
                kitchenService.updateTicketStatus("invalid", TicketStatus.READY));
    }
}
