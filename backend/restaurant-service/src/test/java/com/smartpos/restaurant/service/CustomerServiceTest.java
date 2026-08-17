package com.smartpos.restaurant.service;

import com.smartpos.restaurant.model.Customer;
import com.smartpos.restaurant.model.LoyaltyTier;
import com.smartpos.restaurant.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        testCustomer = Customer.builder()
                .id("cust-1")
                .name("Ahmed Hamdi")
                .phone("+966500000000")
                .loyaltyPoints(50)
                .totalSpent(450.0)
                .tier(LoyaltyTier.BRONZE)
                .build();
    }

    @Test
    @DisplayName("addLoyaltyPoints — Should update points, total spent, and upgrade tier to SILVER")
    void addLoyaltyPoints_shouldUpgradeTier() {
        when(customerRepository.findById("cust-1")).thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));

        Customer updated = customerService.addLoyaltyPoints("cust-1", 20, 100.0);

        assertEquals(70, updated.getLoyaltyPoints());
        assertEquals(550.0, updated.getTotalSpent());
        assertEquals(LoyaltyTier.SILVER, updated.getTier());
    }
}
