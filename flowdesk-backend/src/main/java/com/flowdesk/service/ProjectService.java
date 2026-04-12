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

    List<ProjectResponse> getAllProjects(Long organizationId);

    List<ProjectResponse> getAllProjects(Long organizationId, String status);

    ProjectResponse getProjectById(Long id, Long organizationId);

    ProjectResponse createProject(ProjectCreateRequest request, Long organizationId, Long userId, String userName);

    ProjectResponse updateProject(Long id, ProjectCreateRequest request, Long organizationId, Long userId,
            String userName);

    void deleteProject(Long id, Long organizationId, Long userId, String userName);
}
