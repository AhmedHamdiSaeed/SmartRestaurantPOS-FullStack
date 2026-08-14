package com.smartpos.kitchen.dto;

import com.smartpos.kitchen.model.KitchenStation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenLoadResponse {
    private int overallLoad;
    private List<KitchenStation> stations;
    private int queueDepth;
    private double estimatedDelay;
    private String alertLevel;
    private LocalDateTime lastUpdated;
}
