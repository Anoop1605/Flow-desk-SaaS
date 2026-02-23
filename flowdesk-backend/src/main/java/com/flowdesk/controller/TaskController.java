package com.flowdesk.controller;

import com.flowdesk.dto.AssigneeDTO;
import com.flowdesk.dto.TaskResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * TaskController — Phase 1
 *
 * GET /api/tasks?projectId=X → returns hardcoded mock JSON
 * matching the grouped response shape described in the PRD.
 *
 * Phase 2: will delegate to TaskService for real data.
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*") // Allow frontend dev server in Phase 1
public class TaskController {

    /**
     * GET /api/tasks?projectId=X
     * Returns mock tasks grouped by status for the given project.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getTasksByProject(
            @RequestParam(name = "projectId", required = false, defaultValue = "1") Long projectId) {

        List<TaskResponse> mockTasks = buildMockTasks(projectId);

        // Group by status
        Map<String, List<TaskResponse>> grouped = new LinkedHashMap<>();
        grouped.put("TODO", new ArrayList<>());
        grouped.put("IN_PROGRESS", new ArrayList<>());
        grouped.put("DONE", new ArrayList<>());

        for (TaskResponse task : mockTasks) {
            grouped.getOrDefault(task.getStatus(), new ArrayList<>()).add(task);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("projectId", projectId);
        response.put("projectName", "Website Redesign");
        response.put("tasks", grouped);
        response.put("totalCount", mockTasks.size());

        return ResponseEntity.ok(response);
    }

    // ── Build hardcoded mock tasks ──
    private List<TaskResponse> buildMockTasks(Long projectId) {
        List<TaskResponse> tasks = new ArrayList<>();

        // TODO tasks
        tasks.add(new TaskResponse(
                1L, "Design landing page wireframe",
                "Create low-fidelity wireframes for the new marketing landing page.",
                "TODO", "HIGH", projectId, "Website Redesign",
                new AssigneeDTO(2L, "Bob Smith"),
                LocalDate.of(2026, 3, 1),
                LocalDateTime.of(2026, 2, 20, 10, 0),
                LocalDateTime.of(2026, 2, 20, 10, 0)));

        tasks.add(new TaskResponse(
                2L, "Set up CI/CD pipeline for staging environment",
                "Configure GitHub Actions for automatic deployment to staging.",
                "TODO", "MEDIUM", projectId, "Website Redesign",
                new AssigneeDTO(3L, "Charlie Davis"),
                LocalDate.of(2026, 3, 5),
                LocalDateTime.of(2026, 2, 21, 9, 0),
                LocalDateTime.of(2026, 2, 21, 9, 0)));

        tasks.add(new TaskResponse(
                3L, "Write API documentation for auth endpoints",
                "Document all authentication-related REST API endpoints using Swagger.",
                "TODO", "LOW", projectId, "Website Redesign",
                new AssigneeDTO(1L, "Alice Johnson"),
                LocalDate.of(2026, 3, 10),
                LocalDateTime.of(2026, 2, 22, 14, 0),
                LocalDateTime.of(2026, 2, 22, 14, 0)));

        // IN_PROGRESS tasks
        tasks.add(new TaskResponse(
                4L, "Implement user authentication flow",
                "Build login, registration, and password reset flows with JWT.",
                "IN_PROGRESS", "HIGH", projectId, "Website Redesign",
                new AssigneeDTO(1L, "Alice Johnson"),
                LocalDate.of(2026, 2, 22),
                LocalDateTime.of(2026, 2, 15, 8, 0),
                LocalDateTime.of(2026, 2, 20, 16, 30)));

        tasks.add(new TaskResponse(
                5L, "Create responsive navigation component",
                "Build a responsive navbar with mobile hamburger menu and dropdown.",
                "IN_PROGRESS", "MEDIUM", projectId, "Website Redesign",
                new AssigneeDTO(2L, "Bob Smith"),
                LocalDate.of(2026, 3, 2),
                LocalDateTime.of(2026, 2, 18, 11, 0),
                LocalDateTime.of(2026, 2, 22, 9, 15)));

        tasks.add(new TaskResponse(
                6L, "Integrate payment gateway SDK",
                "Add Stripe payment processing with webhooks for subscription management.",
                "IN_PROGRESS", "HIGH", projectId, "Website Redesign",
                new AssigneeDTO(3L, "Charlie Davis"),
                LocalDate.of(2026, 2, 20),
                LocalDateTime.of(2026, 2, 14, 16, 0),
                LocalDateTime.of(2026, 2, 21, 14, 45)));

        // DONE tasks
        tasks.add(new TaskResponse(
                7L, "Set up project repository and branch strategy",
                "Initialize GitHub repo, set up main/develop branches, and configure branch protection.",
                "DONE", "HIGH", projectId, "Website Redesign",
                new AssigneeDTO(4L, "Diana Lee"),
                LocalDate.of(2026, 2, 10),
                LocalDateTime.of(2026, 2, 5, 9, 0),
                LocalDateTime.of(2026, 2, 10, 17, 0)));

        tasks.add(new TaskResponse(
                8L, "Create design system color palette",
                "Define primary, secondary, and accent colors for the design system.",
                "DONE", "MEDIUM", projectId, "Website Redesign",
                new AssigneeDTO(2L, "Bob Smith"),
                LocalDate.of(2026, 2, 12),
                LocalDateTime.of(2026, 2, 6, 10, 0),
                LocalDateTime.of(2026, 2, 12, 15, 30)));

        tasks.add(new TaskResponse(
                9L, "Database schema design review",
                "Review and finalize ERD for the application database schema.",
                "DONE", "LOW", projectId, "Website Redesign",
                new AssigneeDTO(5L, "Evan Park"),
                LocalDate.of(2026, 2, 14),
                LocalDateTime.of(2026, 2, 8, 13, 0),
                LocalDateTime.of(2026, 2, 14, 11, 0)));

        return tasks;
    }
}
