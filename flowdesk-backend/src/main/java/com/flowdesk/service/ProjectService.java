package com.flowdesk.service;

import com.flowdesk.dto.ProjectCreateRequest;
import com.flowdesk.dto.ProjectResponse;

import java.util.List;

/**
 * ProjectService interface — Member 2
 * Defines the contract for project management operations.
 * Phase 2: implementations will include tenant scoping and RBAC checks.
 */
public interface ProjectService {

    List<ProjectResponse> getAllProjects(Long tenantId);

    ProjectResponse getProjectById(Long id);

    ProjectResponse createProject(ProjectCreateRequest request, Long tenantId, Long ownerId);

    ProjectResponse updateProject(Long id, ProjectCreateRequest request);

    void deleteProject(Long id);
}
