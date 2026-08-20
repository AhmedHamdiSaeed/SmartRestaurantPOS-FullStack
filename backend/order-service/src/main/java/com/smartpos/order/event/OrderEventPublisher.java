package com.smartpos.order.event;

import com.smartpos.order.config.KafkaConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishOrderCreated(OrderCreatedEvent event) {
        try {
            CompletableFuture<SendResult<String, Object>> future =
                kafkaTemplate.send(KafkaConfig.TOPIC_ORDERS_CREATED, event.getOrderId(), event);
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.warn("Kafka not available for OrderCreatedEvent {}: {}", event.getOrderId(), ex.getMessage());
                } else {
                    log.info("Published OrderCreatedEvent for order {} to partition {}",
                        event.getOrderId(), result.getRecordMetadata().partition());
                }
            });
        } catch (Exception e) {
            log.warn("Kafka publishing skipped for OrderCreatedEvent {}: {}", event.getOrderId(), e.getMessage());
        }
    }

    public void publishOrderStatusChanged(OrderStatusChangedEvent event) {
        try {
            CompletableFuture<SendResult<String, Object>> future =
                kafkaTemplate.send(KafkaConfig.TOPIC_ORDERS_STATUS_CHANGED, event.getOrderId(), event);
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.warn("Kafka not available for OrderStatusChangedEvent {}: {}", event.getOrderId(), ex.getMessage());
                } else {
                    log.info("Published OrderStatusChangedEvent for order {} to partition {}",
                        event.getOrderId(), result.getRecordMetadata().partition());
                }
            });
        } catch (Exception e) {
            log.warn("Kafka publishing skipped for OrderStatusChangedEvent {}: {}", event.getOrderId(), e.getMessage());
        }
    }
}
