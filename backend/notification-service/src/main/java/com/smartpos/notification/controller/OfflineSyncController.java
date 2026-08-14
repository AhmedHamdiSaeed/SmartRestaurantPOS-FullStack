package com.smartpos.notification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/offline")
public class OfflineSyncController {

    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> syncBatch(@RequestBody List<Map<String, Object>> actions) {
        Map<String, Object> result = new HashMap<>();
        result.put("total", actions.size());
        result.put("processed", actions.size());
        result.put("status", "SUCCESS");
        return ResponseEntity.ok(result);
    }
}
