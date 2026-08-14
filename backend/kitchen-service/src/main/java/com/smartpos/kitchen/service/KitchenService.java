package com.smartpos.kitchen.service;

import com.smartpos.kitchen.dto.KitchenLoadResponse;
import com.smartpos.kitchen.model.KitchenStation;
import com.smartpos.kitchen.model.enums.StationStatus;
import com.smartpos.kitchen.repository.KitchenStationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class KitchenService {

    private final KitchenStationRepository stationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    public KitchenLoadResponse getKitchenLoad() {
        List<KitchenStation> stations = stationRepository.findAll();
        int totalLoad = 0;
        int totalActive = 0;

        for (KitchenStation s : stations) {
            totalLoad += s.getCurrentLoad() != null ? s.getCurrentLoad() : 0;
            totalActive += s.getActiveOrders() != null ? s.getActiveOrders() : 0;
        }

        int overall = stations.isEmpty() ? 0 : Math.round((float) totalLoad / stations.size());
        String alertLevel = "green";
        if (overall >= 90) alertLevel = "red";
        else if (overall >= 75) alertLevel = "orange";
        else if (overall >= 60) alertLevel = "yellow";

        double estimatedDelay = overall > 60 ? (overall - 60) * 0.5 : 0.0;

        return KitchenLoadResponse.builder()
                .overallLoad(overall)
                .stations(stations)
                .queueDepth(totalActive)
                .estimatedDelay(estimatedDelay)
                .alertLevel(alertLevel)
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    public List<KitchenStation> getStations() {
        return stationRepository.findAll();
    }

    @Scheduled(fixedRate = 5000)
    public void simulateLoadChanges() {
        List<KitchenStation> stations = stationRepository.findAll();
        if (stations.isEmpty()) return;

        for (KitchenStation s : stations) {
            int delta = random.nextInt(11) - 5; // -5 to +5
            int newLoad = Math.max(10, Math.min(95, (s.getCurrentLoad() != null ? s.getCurrentLoad() : 50) + delta));
            s.setCurrentLoad(newLoad);

            if (newLoad >= 85) s.setStatus(StationStatus.OVERLOADED);
            else if (newLoad >= 65) s.setStatus(StationStatus.BUSY);
            else s.setStatus(StationStatus.NORMAL);

            stationRepository.save(s);
        }

        try {
            messagingTemplate.convertAndSend("/topic/kitchen/load", getKitchenLoad());
        } catch (Exception ignored) {}
    }
}
