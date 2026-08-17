package com.smartpos.restaurant.repository;
import com.smartpos.restaurant.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BranchRepository extends JpaRepository<Branch, String> { List<Branch> findByRestaurantIdOrderByName(String restaurantId); }
