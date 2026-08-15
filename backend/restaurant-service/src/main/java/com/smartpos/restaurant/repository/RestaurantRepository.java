package com.smartpos.restaurant.repository;
import com.smartpos.restaurant.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RestaurantRepository extends JpaRepository<Restaurant, String> { boolean existsByCode(String code); }
