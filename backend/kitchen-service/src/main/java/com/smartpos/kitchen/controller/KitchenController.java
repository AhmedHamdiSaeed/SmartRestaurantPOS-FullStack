package com.smartpos.kitchen.controller;

import com.smartpos.kitchen.dto.KitchenLoadResponse;
import com.smartpos.kitchen.model.KitchenStation;
import com.smartpos.kitchen.service.KitchenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/kitchen")
@RequiredArgsConstructor
public class KitchenController {

    private final KitchenService kitchenService;

    @GetMapping("/load")
    public ResponseEntity<KitchenLoadResponse> getKitchenLoad() {
        return ResponseEntity.ok(kitchenService.getKitchenLoad());
    }

    @GetMapping("/stations")
    public ResponseEntity<List<KitchenStation>> getStations() {
        return ResponseEntity.ok(kitchenService.getStations());
    }
}
