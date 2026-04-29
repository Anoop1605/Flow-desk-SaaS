package com.flowdesk.controller;

import com.flowdesk.security.CustomUserDetails;
import com.flowdesk.repository.ProjectRepository;
import com.flowdesk.repository.TaskRepository;
import com.flowdesk.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller for dashboard statistics.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();

        Map<String, Object> stats = new HashMap<>();
        
        // Basic counts
        stats.put("totalProjects", projectRepository.findByOrganizationId(orgId).size());
        stats.put("totalTasks", taskRepository.findByOrganizationId(orgId).size());
        
        // Tasks by status
        Map<String, Long> tasksByStatus = taskRepository.findByOrganizationId(orgId).stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));
        stats.put("tasksByStatus", tasksByStatus);
        
        // Overdue tasks (placeholder logic or simple check)
        stats.put("overdueTasks", 0); 
        
        // Team size
        stats.put("teamSize", userDetails.getUser().getOrganization() != null ? 1 : 0); // Simplified for now

        // Recent Activity
        stats.put("recentActivity", activityLogRepository.findByOrganizationId(orgId, 
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent().stream()
                .map(log -> {
                    Map<String, Object> activityItem = new HashMap<>();
                    activityItem.put("id", log.getId());
                    activityItem.put("type", log.getAction().toLowerCase());
                    activityItem.put("description", log.getDescription());
                    activityItem.put("actorName", log.getUserName());
                    activityItem.put("timestamp", log.getCreatedAt());
                    return activityItem;
                }).collect(Collectors.toList()));

        return ResponseEntity.ok(stats);
    }
}
