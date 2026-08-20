package com.smartpos.order.config;

import com.smartpos.order.dto.OrderItemRequest;
import com.smartpos.order.dto.OrderRequest;
import com.smartpos.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class OrderSimulatorService {

    private final OrderService orderService;
    private final Random random = new Random();

    private static final List<String> CUSTOMERS = Arrays.asList(
            "Tariq Al-Mansoor", "Lina Al-Zahrani", "Youssef Ibrahim", "Reem Al-Hassan",
            "Fahad Al-Otaibi", "Huda Al-Ghamdi", "Sami Kabbani", "Noura Al-Dosari"
    );

    private static final List<String> CHANNELS = Arrays.asList("WALKIN", "DELIVERY", "ONLINE");
    private static final List<String> PRIORITIES = Arrays.asList("NORMAL", "HIGH", "CRITICAL");
    private static final List<String> ADDRESSES = Arrays.asList(
            "Al Olaya St, Riyadh", "King Fahd Rd, Riyadh", "Taliah St, Jeddah", "Corniche Rd, Khobar"
    );

    @Scheduled(fixedRate = 15000, initialDelay = 10000)
    public void generateRealTimeOrder() {
        try {
            OrderRequest req = new OrderRequest();
            String channel = CHANNELS.get(random.nextInt(CHANNELS.size()));
            req.setChannel(channel);
            req.setPriority(PRIORITIES.get(random.nextInt(PRIORITIES.size())));
            req.setCustomerName(CUSTOMERS.get(random.nextInt(CUSTOMERS.size())));

            if ("WALKIN".equals(channel)) {
                req.setTableNumber(random.nextInt(20) + 1);
            } else if ("DELIVERY".equals(channel)) {
                req.setCustomerPhone("+9665" + (10000000 + random.nextInt(89999999)));
                req.setDeliveryAddress(ADDRESSES.get(random.nextInt(ADDRESSES.size())));
            }

            req.setItems(generateRandomItems());
            var created = orderService.createOrder(req);
            log.info("⚡ [OrderSimulator] Simulated new real-time order: {} ({}) for {}",
                    created.getOrderNumber(), created.getChannel(), created.getCustomerName());
        } catch (Exception e) {
            log.warn("Order simulation failed: {}", e.getMessage());
        }
    }

    private List<OrderItemRequest> generateRandomItems() {
        OrderItemRequest[][] combos = new OrderItemRequest[][]{
                { createItem("Double Smash Burger", 1, 58.0, "burgers", "gluten,dairy"), createItem("French Fries", 1, 15.0, "sides", null), createItem("Cola", 1, 10.0, "drinks", null) },
                { createItem("Pepperoni Pizza", 1, 62.0, "pizza", "gluten,dairy"), createItem("Garlic Bread", 1, 18.0, "sides", "gluten"), createItem("Sprite", 1, 10.0, "drinks", null) },
                { createItem("Grilled Chicken Sandwich", 1, 38.0, "sandwiches", "gluten"), createItem("Caesar Salad", 1, 28.0, "salads", "dairy"), createItem("Fresh Lemonade", 1, 12.0, "drinks", null) },
                { createItem("Spaghetti Bolognese", 1, 42.0, "pasta", "gluten"), createItem("Chocolate Cake", 1, 22.0, "desserts", "gluten,eggs,dairy") }
        };
        return Arrays.asList(combos[random.nextInt(combos.length)]);
    }

    private OrderItemRequest createItem(String name, int qty, double price, String cat, String allergens) {
        OrderItemRequest item = new OrderItemRequest();
        item.setName(name);
        item.setQuantity(qty);
        item.setPrice(price);
        item.setCategory(cat);
        item.setAllergens(allergens);
        return item;
    }
}
