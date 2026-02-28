package com.flowdesk.controller;

import com.flowdesk.dto.ProjectResponse;
import com.flowdesk.dto.TeamMemberResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * ProjectController — Phase 1 (Member 2)
 *
 * GET /api/projects         → returns mock project list
 * GET /api/projects/{id}    → returns single mock project
 * GET /api/projects/{id}/members → returns mock member list
 *
 * Phase 2: will delegate to ProjectService and TeamService for real data.
 */
@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*") // Allow frontend dev server in Phase 1
public class ProjectController {

    /**
     * GET /api/projects
     * Returns all mock projects for the current tenant.
     */
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        List<ProjectResponse> projects = buildMockProjects();
        return ResponseEntity.ok(projects);
    }

    /**
     * GET /api/projects/{id}
     * Returns a single mock project by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id) {
        List<ProjectResponse> projects = buildMockProjects();
        ProjectResponse project = projects.stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElse(projects.get(0));
        return ResponseEntity.ok(project);
    }

    /**
     * GET /api/projects/{id}/members
     * Returns mock members for a project.
     */
    @GetMapping("/{id}/members")
    public ResponseEntity<List<TeamMemberResponse>> getProjectMembers(@PathVariable Long id) {
        List<TeamMemberResponse> members = buildMockMembers();
        return ResponseEntity.ok(members);
    }

    // ── Build hardcoded mock projects ──
    private List<ProjectResponse> buildMockProjects() {
        List<ProjectResponse> projects = new ArrayList<>();

        projects.add(new ProjectResponse(
                1L, "Website Redesign",
                "Complete overhaul of the company website with modern design, improved UX, and mobile-first approach.",
                "ACTIVE", "#6366f1", 1L, "Diana Lee",
                5, 9,
                LocalDateTime.of(2026, 1, 15, 9, 0),
                LocalDateTime.of(2026, 2, 23, 14, 30)));

        projects.add(new ProjectResponse(
                2L, "Mobile App MVP",
                "Build the first version of our mobile application targeting iOS and Android platforms.",
                "ACTIVE", "#8b5cf6", 2L, "Alice Johnson",
                4, 12,
                LocalDateTime.of(2026, 1, 20, 10, 0),
                LocalDateTime.of(2026, 2, 22, 16, 0)));

        projects.add(new ProjectResponse(
                3L, "API Platform",
                "Develop a public-facing REST API platform with developer documentation and rate limiting.",
                "ON_HOLD", "#f59e0b", 3L, "Charlie Davis",
                3, 7,
                LocalDateTime.of(2026, 2, 1, 8, 30),
                LocalDateTime.of(2026, 2, 20, 11, 0)));

        projects.add(new ProjectResponse(
                4L, "Q1 Marketing Campaign",
                "Plan and execute the Q1 digital marketing campaign across social media and email channels.",
                "COMPLETED", "#10b981", 4L, "Bob Smith",
                6, 15,
                LocalDateTime.of(2025, 11, 1, 9, 0),
                LocalDateTime.of(2026, 2, 15, 17, 0)));

        return projects;
    }

    // ── Build hardcoded mock team members ──
    private List<TeamMemberResponse> buildMockMembers() {
        List<TeamMemberResponse> members = new ArrayList<>();

        members.add(new TeamMemberResponse(
                1L, 1L, "Alice Johnson", "alice@flowdesk.io",
                "MANAGER", LocalDateTime.of(2026, 1, 15, 9, 0)));

        members.add(new TeamMemberResponse(
                2L, 2L, "Bob Smith", "bob@flowdesk.io",
                "MEMBER", LocalDateTime.of(2026, 1, 16, 10, 0)));

        members.add(new TeamMemberResponse(
                3L, 3L, "Charlie Davis", "charlie@flowdesk.io",
                "MEMBER", LocalDateTime.of(2026, 1, 18, 11, 0)));

        members.add(new TeamMemberResponse(
                4L, 4L, "Diana Lee", "diana@flowdesk.io",
                "MANAGER", LocalDateTime.of(2026, 1, 15, 9, 0)));

        members.add(new TeamMemberResponse(
                5L, 5L, "Evan Park", "evan@flowdesk.io",
                "MEMBER", LocalDateTime.of(2026, 2, 1, 14, 0)));

        return members;
    }
}
