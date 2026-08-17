package com.smartpos.restaurant.repository;
import com.smartpos.restaurant.model.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, String> { List<RestaurantTable> findByBranchIdOrderByTableNumber(String branchId); }
