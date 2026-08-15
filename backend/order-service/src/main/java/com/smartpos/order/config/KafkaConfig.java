package com.smartpos.order.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String TOPIC_ORDERS_CREATED = "orders.created";
    public static final String TOPIC_ORDERS_STATUS_CHANGED = "orders.status-changed";
    public static final String TOPIC_ORDERS_PAID = "orders.paid";

    @Bean
    public NewTopic ordersCreatedTopic() {
        return TopicBuilder.name(TOPIC_ORDERS_CREATED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic ordersStatusChangedTopic() {
        return TopicBuilder.name(TOPIC_ORDERS_STATUS_CHANGED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic ordersPaidTopic() {
        return TopicBuilder.name(TOPIC_ORDERS_PAID).partitions(3).replicas(1).build();
    }
}
