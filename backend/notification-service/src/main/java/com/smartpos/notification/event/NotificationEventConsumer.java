package com.smartpos.notification.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
public class NotificationEventConsumer {

    @KafkaListener(topics = "orders.created", groupId = "notification-service")
    public void handleOrderCreated(Map<String, Object> event) {
        log.info("🔔 [NOTIFICATION STUB] New Order Created: Order #{} for Table {}. Dispatching push notification...",
                event.get("orderNumber"), event.get("tableNumber"));
    }

    @KafkaListener(topics = "orders.status-changed", groupId = "notification-service")
    public void handleOrderStatusChanged(Map<String, Object> event) {
        log.info("🔔 [NOTIFICATION STUB] Order Status Changed: Order #{} → {}. Sending customer SMS update...",
                event.get("orderNumber"), event.get("newStatus"));
    }
}
