package com.smartpos.order.config;

import com.smartpos.order.dto.OrderItemRequest;
import com.smartpos.order.dto.OrderRequest;
import com.smartpos.order.dto.OrderStatusUpdateRequest;
import com.smartpos.order.repository.OrderRepository;
import com.smartpos.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Override
    public void run(String... args) {
        if (orderRepository.count() == 0) {
            // Order 1: WALKIN - RECEIVED
            OrderRequest o1 = new OrderRequest();
            o1.setChannel("WALKIN");
            o1.setPriority("NORMAL");
            o1.setCustomerName("Ahmed Ali");
            o1.setTableNumber(5);
            o1.setItems(Arrays.asList(
                    createItem("Classic Burger", 1, 45.0, "burgers", "gluten,dairy"),
                    createItem("French Fries", 1, 15.0, "sides", null),
                    createItem("Cola", 1, 10.0, "drinks", null)
            ));
            orderService.createOrder(o1);

            // Order 2: DELIVERY - PREPARING
            OrderRequest o2 = new OrderRequest();
            o2.setChannel("DELIVERY");
            o2.setPriority("HIGH");
            o2.setCustomerName("Fatima Hassan");
            o2.setCustomerPhone("+966501234567");
            o2.setDeliveryAddress("King Fahd Rd, Riyadh");
            o2.setItems(Arrays.asList(
                    createItem("Margherita Pizza", 1, 55.0, "pizza", "dairy,gluten"),
                    createItem("Garlic Bread", 2, 18.0, "sides", "gluten")
            ));
            var created2 = orderService.createOrder(o2);
            orderService.updateStatus(created2.getId(), createStatusReq("PREPARING", "Kitchen preparing pizza"));

            // Order 3: ONLINE - READY
            OrderRequest o3 = new OrderRequest();
            o3.setChannel("ONLINE");
            o3.setPriority("NORMAL");
            o3.setCustomerName("Mohammed Salem");
            o3.setItems(Arrays.asList(
                    createItem("Grilled Chicken Sandwich", 1, 38.0, "sandwiches", "gluten"),
                    createItem("Caesar Salad", 1, 28.0, "salads", "dairy"),
                    createItem("Fresh Lemonade", 2, 12.0, "drinks", null)
            ));
            var created3 = orderService.createOrder(o3);
            orderService.updateStatus(created3.getId(), createStatusReq("PREPARING", null));
            orderService.updateStatus(created3.getId(), createStatusReq("READY", "Order ready for pickup"));

            // Order 4: WALKIN - PREPARING (CRITICAL)
            OrderRequest o4 = new OrderRequest();
            o4.setChannel("WALKIN");
            o4.setPriority("CRITICAL");
            o4.setCustomerName("Nour Al-Din");
            o4.setTableNumber(12);
            o4.setItems(Arrays.asList(
                    createItem("Double Smash Burger", 2, 58.0, "burgers", "gluten,dairy"),
                    createItem("Onion Rings", 1, 18.0, "sides", "gluten")
            ));
            var created4 = orderService.createOrder(o4);
            orderService.updateStatus(created4.getId(), createStatusReq("PREPARING", "Kitchen overload"));

            // Order 5: DELIVERY - DELIVERED
            OrderRequest o5 = new OrderRequest();
            o5.setChannel("DELIVERY");
            o5.setPriority("NORMAL");
            o5.setCustomerName("Sara Khan");
            o5.setDeliveryAddress("Al Olaya St, Riyadh");
            o5.setItems(Arrays.asList(
                    createItem("Pepperoni Pizza", 1, 62.0, "pizza", "gluten,dairy"),
                    createItem("Buffalo Wings", 1, 32.0, "sides", null),
                    createItem("Sprite", 2, 10.0, "drinks", null)
            ));
            var created5 = orderService.createOrder(o5);
            orderService.updateStatus(created5.getId(), createStatusReq("PREPARING", null));
            orderService.updateStatus(created5.getId(), createStatusReq("READY", null));
            orderService.updateStatus(created5.getId(), createStatusReq("DELIVERED", "Out for delivery"));

            // Order 6: ONLINE - RECEIVED
            OrderRequest o6 = new OrderRequest();
            o6.setChannel("ONLINE");
            o6.setPriority("HIGH");
            o6.setCustomerName("Ziad Mansoor");
            o6.setItems(Arrays.asList(
                    createItem("Spaghetti Bolognese", 1, 42.0, "pasta", "gluten"),
                    createItem("Chocolate Cake", 1, 22.0, "desserts", "dairy,eggs")
            ));
            orderService.createOrder(o6);
        }
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

    private OrderStatusUpdateRequest createStatusReq(String status, String reason) {
        OrderStatusUpdateRequest req = new OrderStatusUpdateRequest();
        req.setStatus(status);
        req.setReason(reason);
        return req;
    }
}
