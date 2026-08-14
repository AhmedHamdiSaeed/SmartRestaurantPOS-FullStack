package com.smartpos.ai.controller;

import com.smartpos.ai.model.AiSuggestion;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    @GetMapping("/suggestions/{orderId}")
    public SseEmitter streamSuggestions(@PathVariable String orderId) {
        SseEmitter emitter = new SseEmitter(60000L);

        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                List<AiSuggestion> list = Arrays.asList(
                    AiSuggestion.builder()
                        .id(UUID.randomUUID().toString())
                        .orderId(orderId)
                        .type("upsell")
                        .severity("info")
                        .title("Upsell Opportunity")
                        .message("Customer ordered a burger without a drink. Recommend adding Fresh Lemonade for +12 SAR.")
                        .actionLabel("Add Lemonade")
                        .confidence(0.88)
                        .generatedAt(LocalDateTime.now())
                        .build(),
                    AiSuggestion.builder()
                        .id(UUID.randomUUID().toString())
                        .orderId(orderId)
                        .type("allergy_warning")
                        .severity("warning")
                        .title("Allergen Alert")
                        .message("Order contains Dairy and Gluten. Verify with kitchen staff before serving.")
                        .actionLabel("Flag Kitchen")
                        .confidence(0.95)
                        .generatedAt(LocalDateTime.now())
                        .build(),
                    AiSuggestion.builder()
                        .id(UUID.randomUUID().toString())
                        .orderId(orderId)
                        .type("loyalty_reward")
                        .severity("success")
                        .title("Loyalty Bonus Available")
                        .message("Customer has 120 points! Eligible for a free dessert.")
                        .actionLabel("Redeem Reward")
                        .confidence(0.92)
                        .generatedAt(LocalDateTime.now())
                        .build()
                );

                for (AiSuggestion sug : list) {
                    Thread.sleep(600);
                    emitter.send(sug);
                }
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }
}
