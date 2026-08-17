package com.smartpos.restaurant.repository;

import com.smartpos.restaurant.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, String> {
    Optional<Customer> findByPhone(String phone);
    List<Customer> findByNameContainingIgnoreCaseOrPhoneContaining(String name, String phone);
}
