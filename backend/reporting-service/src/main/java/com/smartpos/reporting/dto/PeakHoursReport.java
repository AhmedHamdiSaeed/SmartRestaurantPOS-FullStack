package com.smartpos.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeakHoursReport {
    private String tenantId;
    private String busiestHour;
    private int peakOrderVolume;
    private List<HourlyStat> hourlyStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyStat {
        private int hour; // 0..23
        private String timeLabel; // e.g. "12:00 PM"
        private int orderCount;
        private double revenue;
    }
}
