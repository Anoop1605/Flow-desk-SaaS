package com.flowdesk.service;

import com.flowdesk.dto.ProjectCreateRequest;
import com.flowdesk.dto.ProjectResponse;
import com.flowdesk.entity.Project;
import com.flowdesk.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ProjectServiceImpl
 * Implements ProjectService with JPA persistence and organization-scoping.
 */
@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ActivityLogService activityLogService;

    public ProjectServiceImpl(ProjectRepository projectRepository, ActivityLogService activityLogService) {
        this.projectRepository = projectRepository;
        this.activityLogService = activityLogService;
    }

    @Override
    public List<ProjectResponse> getAllProjects(Long organizationId) {
        return projectRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ProjectResponse getProjectById(Long id, Long organizationId) {
        return projectRepository.findById(id)
                .filter(p -> p.getOrganization().getId().equals(organizationId))
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    @Override
    public ProjectResponse createProject(ProjectCreateRequest request, Long organizationId, Long userId, String userName) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setColorTag(request.getColorTag());
        project.setOwnerId(userId);
        
        com.flowdesk.entity.Organization org = new com.flowdesk.entity.Organization();
        org.setId(organizationId);
        project.setOrganization(org);
        
        Project saved = projectRepository.save(project);

        // Log Activity
        activityLogService.log("CREATED_PROJECT", 
                userName + " created project: " + project.getName(), 
                userId, userName, organizationId, saved.getId(), "PROJECT");

        return mapToResponse(saved);
    }

    @Override
    public ProjectResponse updateProject(Long id, ProjectCreateRequest request, Long organizationId, Long userId, String userName) {
        Project project = projectRepository.findById(id)
                .filter(p -> p.getOrganization().getId().equals(organizationId))
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setColorTag(request.getColorTag());
        
        Project saved = projectRepository.save(project);

        // Log Activity
        activityLogService.log("UPDATED_PROJECT", 
                userName + " updated project: " + project.getName(), 
                userId, userName, organizationId, saved.getId(), "PROJECT");

        return mapToResponse(saved);
    }

    @Override
    public void deleteProject(Long id, Long organizationId, Long userId, String userName) {
        Project project = projectRepository.findById(id)
                .filter(p -> p.getOrganization().getId().equals(organizationId))
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        String projectName = project.getName();
        projectRepository.delete(project);

        // Log Activity
        activityLogService.log("DELETED_PROJECT", 
                userName + " deleted project: " + projectName, 
                userId, userName, organizationId, id, "PROJECT");
    }

    private ProjectResponse mapToResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setStatus(project.getStatus().name());
        response.setColorTag(project.getColorTag());
        response.setOwnerId(project.getOwnerId());
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());
        return response;
    }
}
