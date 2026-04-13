package com.flowdesk.controller;

import com.flowdesk.dto.ProjectCreateRequest;
import com.flowdesk.dto.ProjectResponse;
import com.flowdesk.dto.TeamMemberResponse;
import com.flowdesk.security.CustomUserDetails;
import com.flowdesk.service.ProjectService;
import com.flowdesk.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ProjectController
 * Handles all project-related endpoints with multi-tenant isolation.
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = { "http://localhost:*", "http://127.0.0.1:*" })
public class ProjectController {

    private final ProjectService projectService;
    private final TeamService teamService;

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects(
            Authentication authentication,
            @RequestParam(name = "status", required = false) String status) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(projectService.getAllProjects(orgId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(projectService.getProjectById(id, orgId));
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectCreateRequest request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(projectService.createProject(request, orgId, userDetails.getUser().getId(),
                userDetails.getUser().getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable Long id,
            @RequestBody ProjectCreateRequest request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(projectService.updateProject(id, request, orgId, userDetails.getUser().getId(),
                userDetails.getUser().getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        projectService.deleteProject(id, orgId, userDetails.getUser().getId(), userDetails.getUser().getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<TeamMemberResponse>> getProjectMembers(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getProjectMembers(id));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<TeamMemberResponse> addProjectMember(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload) {
        Long userId = Long.valueOf(payload.get("userId"));
        String role = payload.getOrDefault("role", "MEMBER");
        return ResponseEntity.ok(teamService.addMemberToProject(id, userId, role));
    }

    @PutMapping("/{id}/members/{userId}")
    public ResponseEntity<TeamMemberResponse> updateProjectMemberRole(
            @PathVariable Long id,
            @PathVariable Long userId,
            @RequestBody java.util.Map<String, String> payload) {
        String role = payload.getOrDefault("role", "MEMBER");
        return ResponseEntity.ok(teamService.changeMemberRole(id, userId, role));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeProjectMember(@PathVariable Long id, @PathVariable Long userId) {
        teamService.removeMemberFromProject(id, userId);
        return ResponseEntity.noContent().build();
    }
}
