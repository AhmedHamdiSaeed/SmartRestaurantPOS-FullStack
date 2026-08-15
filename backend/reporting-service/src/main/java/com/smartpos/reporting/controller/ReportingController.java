package com.smartpos.reporting.controller;

import com.smartpos.reporting.dto.PeakHoursReport;
import com.smartpos.reporting.dto.SalesSummaryReport;
import com.smartpos.reporting.service.ReportingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Analytics", description = "Financial performance, sales summary, and peak hour distribution reports")
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/sales")
    @Operation(summary = "Get sales summary report (TODAY, THIS_WEEK, THIS_MONTH)")
    public ResponseEntity<SalesSummaryReport> getSalesSummary(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId,
            @RequestParam(defaultValue = "TODAY") String period) {
        return ResponseEntity.ok(reportingService.getSalesSummary(tenantId, period));
    }

    @GetMapping("/peak-hours")
    @Operation(summary = "Get hourly order volume and revenue distribution")
    public ResponseEntity<PeakHoursReport> getPeakHours(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(reportingService.getPeakHoursReport(tenantId));
    }
}
