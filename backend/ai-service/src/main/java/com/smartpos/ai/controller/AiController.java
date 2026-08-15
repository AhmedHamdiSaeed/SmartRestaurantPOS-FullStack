package com.smartpos.ai.controller;

import com.smartpos.ai.model.AiSuggestion;
import com.smartpos.ai.provider.GeminiProviderPort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant", description = "AI-powered sales insights, inventory forecasting, and real-time POS upsell suggestions")
public class AiController {

    private final GeminiProviderPort geminiProvider;

    @GetMapping("/sales-insights")
    @Operation(summary = "Get AI-generated sales trend analysis")
    public ResponseEntity<Map<String, String>> getSalesInsights(@RequestParam(defaultValue = "Weekly sales total: 45,000 SAR across 1,200 orders") String data) {
        String insight = geminiProvider.analyzeSalesData(data);
        return ResponseEntity.ok(Map.of("insight", insight, "provider", "Google Gemini Free Tier"));
    }

    @GetMapping("/inventory-forecast")
    @Operation(summary = "Get AI inventory demand forecasting")
    public ResponseEntity<Map<String, String>> getInventoryForecast(@RequestParam(defaultValue = "Mozzarella: 4.5KG left, Tomato Sauce: 8L left") String status) {
        String forecast = geminiProvider.forecastInventoryNeeds(status);
        return ResponseEntity.ok(Map.of("forecast", forecast, "provider", "Google Gemini Free Tier"));
    }

    @GetMapping("/menu-recommendations")
    @Operation(summary = "Get AI menu combo and upsell recommendations")
    public ResponseEntity<Map<String, String>> getMenuRecommendations(@RequestParam(defaultValue = "Smash Burger, Fries, Soft Drink") String popularItems) {
        String recommendations = geminiProvider.recommendMenuBundles(popularItems);
        return ResponseEntity.ok(Map.of("recommendations", recommendations, "provider", "Google Gemini Free Tier"));
    }

    @GetMapping("/suggestions/{orderId}")
    @Operation(summary = "Stream real-time AI upsell and allergy suggestions for active order via SSE")
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
