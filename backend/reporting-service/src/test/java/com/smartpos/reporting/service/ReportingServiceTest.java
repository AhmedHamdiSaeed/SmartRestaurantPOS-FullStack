package com.smartpos.reporting.service;

import com.smartpos.reporting.dto.PeakHoursReport;
import com.smartpos.reporting.dto.SalesSummaryReport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ReportingServiceTest {

    private ReportingService reportingService;

    @BeforeEach
    void setUp() {
        reportingService = new ReportingService();
    }

    @Test
    @DisplayName("getSalesSummary — Should calculate revenue, tax, and category breakdown")
    void getSalesSummary_shouldCalculateCorrectly() {
        SalesSummaryReport report = reportingService.getSalesSummary("tenant-1", "today");

        assertNotNull(report);
        assertEquals("TODAY", report.getPeriod());
        assertTrue(report.getTotalRevenue() > 0);
        assertTrue(report.getTaxCollected() > 0);
        assertFalse(report.getCategoryBreakdown().isEmpty());
    }

    @Test
    @DisplayName("getPeakHoursReport — Should generate hourly distribution and identify busiest hour")
    void getPeakHoursReport_shouldIdentifyPeakHour() {
        PeakHoursReport report = reportingService.getPeakHoursReport("tenant-1");

        assertNotNull(report);
        assertNotNull(report.getBusiestHour());
        assertTrue(report.getPeakOrderVolume() > 0);
        assertEquals(16, report.getHourlyStats().size()); // 8am to 11pm
    }
}
