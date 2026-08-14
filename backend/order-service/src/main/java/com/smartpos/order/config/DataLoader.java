package com.smartpos.order.config;

import com.smartpos.order.dto.OrderItemRequest;
import com.smartpos.order.dto.OrderRequest;
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
            OrderRequest o1 = new OrderRequest();
            o1.setChannel("WALKIN");
            o1.setPriority("NORMAL");
            o1.setCustomerName("Ahmed Ali");
            o1.setTableNumber(5);
            OrderItemRequest i1 = new OrderItemRequest(); i1.setName("Classic Burger"); i1.setQuantity(1); i1.setPrice(45.0); i1.setCategory("burgers"); i1.setAllergens("gluten,dairy");
            OrderItemRequest i2 = new OrderItemRequest(); i2.setName("French Fries"); i2.setQuantity(1); i2.setPrice(15.0); i2.setCategory("sides");
            OrderItemRequest i3 = new OrderItemRequest(); i3.setName("Cola"); i3.setQuantity(1); i3.setPrice(10.0); i3.setCategory("drinks");
            o1.setItems(Arrays.asList(i1, i2, i3));
            orderService.createOrder(o1);

            OrderRequest o2 = new OrderRequest();
            o2.setChannel("DELIVERY");
            o2.setPriority("HIGH");
            o2.setCustomerName("Fatima Hassan");
            o2.setCustomerPhone("+966501234567");
            o2.setDeliveryAddress("King Fahd Rd, Riyadh");
            OrderItemRequest i4 = new OrderItemRequest(); i4.setName("Margherita Pizza"); i4.setQuantity(1); i4.setPrice(55.0); i4.setCategory("pizza"); i4.setAllergens("dairy,gluten");
            OrderItemRequest i5 = new OrderItemRequest(); i5.setName("Garlic Bread"); i5.setQuantity(2); i5.setPrice(18.0); i5.setCategory("sides");
            o2.setItems(Arrays.asList(i4, i5));
            orderService.createOrder(o2);

            OrderRequest o3 = new OrderRequest();
            o3.setChannel("ONLINE");
            o3.setPriority("NORMAL");
            o3.setCustomerName("Mohammed Salem");
            OrderItemRequest i6 = new OrderItemRequest(); i6.setName("Grilled Chicken Sandwich"); i6.setQuantity(1); i6.setPrice(38.0); i6.setCategory("sandwiches");
            OrderItemRequest i7 = new OrderItemRequest(); i7.setName("Caesar Salad"); i7.setQuantity(1); i7.setPrice(28.0); i7.setCategory("salads");
            o3.setItems(Arrays.asList(i6, i7));
            orderService.createOrder(o3);
        }
    }
}
