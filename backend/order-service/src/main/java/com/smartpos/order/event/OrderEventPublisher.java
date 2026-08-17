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
        CompletableFuture<SendResult<String, Object>> future =
            kafkaTemplate.send(KafkaConfig.TOPIC_ORDERS_CREATED, event.getOrderId(), event);
        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to publish OrderCreatedEvent for order {}: {}", event.getOrderId(), ex.getMessage());
            } else {
                log.info("Published OrderCreatedEvent for order {} to partition {}",
                    event.getOrderId(), result.getRecordMetadata().partition());
            }
        });
    }

    public void publishOrderStatusChanged(OrderStatusChangedEvent event) {
        CompletableFuture<SendResult<String, Object>> future =
            kafkaTemplate.send(KafkaConfig.TOPIC_ORDERS_STATUS_CHANGED, event.getOrderId(), event);
        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to publish OrderStatusChangedEvent for order {}: {}", event.getOrderId(), ex.getMessage());
            } else {
                log.info("Published OrderStatusChangedEvent for order {} to partition {}",
                    event.getOrderId(), result.getRecordMetadata().partition());
            }
        });
    }
}
