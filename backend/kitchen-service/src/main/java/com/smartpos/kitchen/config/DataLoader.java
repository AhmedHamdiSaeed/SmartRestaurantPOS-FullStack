package com.smartpos.kitchen.config;

import com.smartpos.kitchen.model.KitchenStation;
import com.smartpos.kitchen.model.enums.StationStatus;
import com.smartpos.kitchen.model.enums.StationType;
import com.smartpos.kitchen.repository.KitchenStationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final KitchenStationRepository stationRepository;

    @Override
    public void run(String... args) {
        if (stationRepository.count() == 0) {
            stationRepository.saveAll(Arrays.asList(
                KitchenStation.builder().name("Main Grill").type(StationType.GRILL).currentLoad(45).maxCapacity(8).activeOrders(3).avgPrepTime(12.0).status(StationStatus.NORMAL).build(),
                KitchenStation.builder().name("Deep Fryer").type(StationType.FRYER).currentLoad(60).maxCapacity(6).activeOrders(4).avgPrepTime(8.0).status(StationStatus.NORMAL).build(),
                KitchenStation.builder().name("Salad Bar").type(StationType.SALAD).currentLoad(25).maxCapacity(5).activeOrders(1).avgPrepTime(5.0).status(StationStatus.NORMAL).build(),
                KitchenStation.builder().name("Dessert Station").type(StationType.DESSERT).currentLoad(30).maxCapacity(4).activeOrders(1).avgPrepTime(10.0).status(StationStatus.NORMAL).build(),
                KitchenStation.builder().name("Beverage Station").type(StationType.DRINKS).currentLoad(20).maxCapacity(10).activeOrders(2).avgPrepTime(3.0).status(StationStatus.NORMAL).build(),
                KitchenStation.builder().name("Packaging").type(StationType.PACKAGING).currentLoad(55).maxCapacity(8).activeOrders(5).avgPrepTime(4.0).status(StationStatus.NORMAL).build()
            ));
        }
    }
}
