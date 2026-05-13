package com.inventory.module.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * REST Controller for collecting metrics from mobile apps.
 *
 * Endpoints:
 * - POST /api/metrics - Receive metrics/events from the app
 * - GET /api/metrics - Get all collected metrics
 * - DELETE /api/metrics - Clear metrics
 */
@Slf4j
@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final ConcurrentHashMap<String, MetricEntry> metrics = new ConcurrentHashMap<>();

    /**
     * Receives a metric/event from the mobile app.
     *
     * @param request the metric data (event, properties, timestamp, platform)
     * @return success message
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> receiveMetric(@RequestBody Map<String, Object> request) {
        String event = (String) request.getOrDefault("event", "unknown");
        Map<String, Object> properties = (Map<String, Object>) request.getOrDefault("properties", Map.of());
        String platform = (String) request.getOrDefault("platform", "unknown");

        String key = event + "_" + LocalDateTime.now().toString();
        metrics.put(key, new MetricEntry(event, properties, platform, LocalDateTime.now()));

        log.info("Received metric: event={}, platform={}", event, platform);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Metric received"
        ));
    }

    /**
     * Gets all collected metrics.
     *
     * @return all metrics
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getMetrics() {
        Map<String, Object> response = new ConcurrentHashMap<>();
        metrics.forEach((key, entry) -> {
            response.put(key, Map.of(
                "event", entry.event(),
                "properties", entry.properties(),
                "platform", entry.platform(),
                "timestamp", entry.timestamp().toString()
            ));
        });

        return ResponseEntity.ok(Map.of(
            "metrics", response,
            "count", metrics.size()
        ));
    }

    /**
     * Clears all collected metrics.
     *
     * @return success message
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> clearMetrics() {
        metrics.clear();
        log.info("Metrics cleared");

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Metrics cleared"
        ));
    }

    public record MetricEntry(
        String event,
        Map<String, Object> properties,
        String platform,
        LocalDateTime timestamp
    ) {}
}