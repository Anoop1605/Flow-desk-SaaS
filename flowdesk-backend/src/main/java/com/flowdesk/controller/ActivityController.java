package com.flowdesk.controller;

import com.flowdesk.dto.ActivityResponse;
import com.flowdesk.entity.ActivityLog;
import com.flowdesk.security.CustomUserDetails;
import com.flowdesk.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for activity log operations.
 */
@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = { "http://localhost:*", "http://127.0.0.1:*" })
public class ActivityController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getActivityFeed(
            Authentication authentication,
            @RequestParam(name = "actionType", required = false) List<String> actionTypes) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();

        List<ActivityLog> logs;
        if (actionTypes == null || actionTypes.isEmpty()) {
            logs = activityLogService.findByOrganization(orgId);
        } else {
            logs = activityLogService.findByOrganizationAndActions(orgId, actionTypes);
        }

        List<ActivityResponse> response = logs.stream().map(this::toResponse).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    private ActivityResponse toResponse(ActivityLog log) {
        ActivityResponse response = new ActivityResponse();
        response.setId(log.getId());
        response.setAction(log.getAction());
        response.setDescription(log.getDescription());
        response.setUserId(log.getUserId());
        response.setUserName(log.getUserName());
        response.setEntityId(log.getEntityId());
        response.setEntityType(log.getEntityType());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }
}
