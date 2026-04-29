package com.flowdesk.controller;

import com.flowdesk.entity.ActivityLog;
import com.flowdesk.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for activity log operations.
 */
@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getActivityFeed() {
        // In a real multi-tenant app, we would filter by organizationId
        // For Phase 2, we return all logs for simplicity or the latest 50
        List<ActivityLog> logs = activityLogService.findAll();
        return ResponseEntity.ok(logs);
    }
}
