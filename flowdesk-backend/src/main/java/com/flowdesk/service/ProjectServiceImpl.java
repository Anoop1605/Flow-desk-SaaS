package com.flowdesk.service;

import com.flowdesk.dto.ProjectCreateRequest;
import com.flowdesk.dto.ProjectResponse;
import com.flowdesk.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ProjectServiceImpl — Member 2
 * Stub implementation for Phase 1. Methods throw UnsupportedOperationException
 * since the ProjectController returns mock data directly in Phase 1.
 * Phase 2: will implement full CRUD with tenant scoping.
 */
@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    public List<ProjectResponse> getAllProjects(Long tenantId) {
        // Phase 2: return projectRepository.findByTenantId(tenantId) mapped to DTOs
        throw new UnsupportedOperationException("Phase 2: implement with tenant scoping");
    }

    @Override
    public ProjectResponse getProjectById(Long id) {
        // Phase 2: fetch from repo, map to DTO
        throw new UnsupportedOperationException("Phase 2: implement with tenant scoping");
    }

    @Override
    public ProjectResponse createProject(ProjectCreateRequest request, Long tenantId, Long ownerId) {
        // Phase 2: map DTO → entity, save, return response
        throw new UnsupportedOperationException("Phase 2: implement with tenant scoping");
    }

    @Override
    public ProjectResponse updateProject(Long id, ProjectCreateRequest request) {
        // Phase 2: find by id, apply updates, save, return
        throw new UnsupportedOperationException("Phase 2: implement");
    }

    @Override
    public void deleteProject(Long id) {
        // Phase 2: soft delete or archive
        throw new UnsupportedOperationException("Phase 2: implement");
    }
}
