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
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectController {

    private final ProjectService projectService;
    private final TeamService teamService;

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(projectService.getAllProjects(orgId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(projectService.getProjectById(id, orgId));
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectCreateRequest request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(projectService.createProject(request, orgId, userDetails.getUser().getId(), userDetails.getUser().getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable Long id, @RequestBody ProjectCreateRequest request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long orgId = userDetails.getUser().getOrganization().getId();
        return ResponseEntity.ok(projectService.updateProject(id, request, orgId, userDetails.getUser().getId(), userDetails.getUser().getName()));
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
        // Phase 4: Implement with TeamService
        return ResponseEntity.ok(teamService.getProjectMembers(id));
    }
}
