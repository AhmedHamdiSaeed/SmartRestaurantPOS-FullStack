package com.smartpos.restaurant.service;

import com.smartpos.restaurant.model.Customer;
import com.smartpos.restaurant.model.LoyaltyTier;
import com.smartpos.restaurant.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional
    public Customer createCustomer(Customer customer) {
        if (customer.getPhone() != null && customerRepository.findByPhone(customer.getPhone()).isPresent()) {
            throw new IllegalArgumentException("Customer with phone number already exists: " + customer.getPhone());
        }
        return customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public List<Customer> searchCustomers(String query) {
        if (query == null || query.isBlank()) {
            return customerRepository.findAll();
        }
        return customerRepository.findByNameContainingIgnoreCaseOrPhoneContaining(query, query);
    }

    @Transactional
    public Customer addLoyaltyPoints(String customerId, int points, double orderTotal) {
        Customer c = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));

        c.setLoyaltyPoints(c.getLoyaltyPoints() + points);
        c.setTotalSpent(c.getTotalSpent() + orderTotal);
        c.setVisitCount(c.getVisitCount() + 1);
        c.setLastVisitAt(LocalDateTime.now());

        // Tier re-calculation based on total spent
        if (c.getTotalSpent() >= 5000.0) c.setTier(LoyaltyTier.VIP);
        else if (c.getTotalSpent() >= 2000.0) c.setTier(LoyaltyTier.GOLD);
        else if (c.getTotalSpent() >= 500.0) c.setTier(LoyaltyTier.SILVER);
        else c.setTier(LoyaltyTier.BRONZE);

        return customerRepository.save(c);
    }
}
