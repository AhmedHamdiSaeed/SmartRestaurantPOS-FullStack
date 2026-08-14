package com.smartpos.ai.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSuggestion {
    private String id;
    private String orderId;
    private String type;
    private String severity;
    private String title;
    private String message;
    private String actionLabel;
    private double confidence;
    private LocalDateTime generatedAt;
}
