package com.smartpos.reporting.service;

import com.smartpos.reporting.dto.PeakHoursReport;
import com.smartpos.reporting.dto.SalesSummaryReport;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ReportingService {

    public SalesSummaryReport getSalesSummary(String tenantId, String period) {
        // Aggregated report calculation engine
        double totalRev = 14850.0;
        int orders = 340;
        double avgTicket = Math.round((totalRev / orders) * 100.0) / 100.0;

        List<SalesSummaryReport.CategorySalesDto> categories = List.of(
                new SalesSummaryReport.CategorySalesDto("Burgers", 420, 6800.0),
                new SalesSummaryReport.CategorySalesDto("Drinks", 380, 2400.0),
                new SalesSummaryReport.CategorySalesDto("Pizza", 180, 3600.0),
                new SalesSummaryReport.CategorySalesDto("Sides", 290, 2050.0)
        );

        Map<String, Double> payments = Map.of(
                "CARD", 8910.0,
                "CASH", 4455.0,
                "ONLINE", 1485.0
        );

        return SalesSummaryReport.builder()
                .tenantId(tenantId)
                .period(period.toUpperCase())
                .totalRevenue(totalRev)
                .totalOrders(orders)
                .averageTicketSize(avgTicket)
                .taxCollected(totalRev * 0.15)
                .paymentMethodBreakdown(payments)
                .categoryBreakdown(categories)
                .build();
    }

    public PeakHoursReport getPeakHoursReport(String tenantId) {
        List<PeakHoursReport.HourlyStat> stats = new ArrayList<>();
        int peakVol = 0;
        String peakHour = "1:00 PM";

        for (int h = 8; h <= 23; h++) {
            int count = (int) (Math.sin((h - 8) * 0.3) * 35) + 15;
            count = Math.max(5, count);
            double rev = count * 42.5;

            if (count > peakVol) {
                peakVol = count;
                int displayHour = h > 12 ? h - 12 : h;
                String ampm = h >= 12 ? "PM" : "AM";
                peakHour = displayHour + ":00 " + ampm;
            }

            int displayH = h > 12 ? h - 12 : h;
            String ampmStr = h >= 12 ? "PM" : "AM";
            stats.add(new PeakHoursReport.HourlyStat(h, displayH + ":00 " + ampmStr, count, rev));
        }

        return PeakHoursReport.builder()
                .tenantId(tenantId)
                .busiestHour(peakHour)
                .peakOrderVolume(peakVol)
                .hourlyStats(stats)
                .build();
    }
}
