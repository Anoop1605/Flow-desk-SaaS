package com.flowdesk.controller;

import com.flowdesk.dto.TaskResponse;
import com.flowdesk.security.CustomUserDetails;
import com.flowdesk.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * TaskController
 * Handles all task-related endpoints with multi-tenant isolation.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getTasksByProject(
            @RequestParam(name = "projectId") Long projectId,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();

        List<TaskResponse> tasks = taskService.getTasksByProjectId(projectId, orgId);

        // Group by status for the Kanban board
        Map<String, List<TaskResponse>> grouped = new LinkedHashMap<>();
        grouped.put("TODO", new ArrayList<>());
        grouped.put("IN_PROGRESS", new ArrayList<>());
        grouped.put("DONE", new ArrayList<>());

        for (TaskResponse task : tasks) {
            grouped.getOrDefault(task.getStatus(), new ArrayList<>()).add(task);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("projectId", projectId);
        response.put("tasks", grouped);
        response.put("totalCount", tasks.size());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(taskService.getTaskById(id, orgId));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@RequestBody com.flowdesk.dto.TaskCreateRequest request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(taskService.createTask(request, orgId, userDetails.getUser().getId(), userDetails.getUser().getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id, @RequestBody com.flowdesk.dto.TaskCreateRequest request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(taskService.updateTask(id, request, orgId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(@PathVariable Long id, @RequestBody com.flowdesk.dto.TaskStatusUpdateRequest request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(taskService.updateTaskStatus(id, request, orgId, userDetails.getUser().getId(), userDetails.getUser().getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        taskService.deleteTask(id, orgId, userDetails.getUser().getId(), userDetails.getUser().getName());
        return ResponseEntity.noContent().build();
    }
}
