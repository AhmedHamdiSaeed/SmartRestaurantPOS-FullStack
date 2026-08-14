package com.smartpos.kitchen.repository;

import com.smartpos.kitchen.model.KitchenStation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KitchenStationRepository extends JpaRepository<KitchenStation, String> {
}
