package com.flowdesk.service;

import com.flowdesk.dto.AssigneeDTO;
import com.flowdesk.dto.TaskCreateRequest;
import com.flowdesk.dto.TaskResponse;
import com.flowdesk.dto.TaskStatusUpdateRequest;
import com.flowdesk.entity.Task;
import com.flowdesk.repository.ProjectRepository;
import com.flowdesk.repository.TaskRepository;
import com.flowdesk.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * TaskServiceImpl
 * Implements TaskService with JPA persistence and organization-scoping.
 */
@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ActivityLogService activityLogService;

    public TaskServiceImpl(TaskRepository taskRepository, UserRepository userRepository,
            ProjectRepository projectRepository, ActivityLogService activityLogService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.activityLogService = activityLogService;
    }

    @Override
    public TaskResponse createTask(TaskCreateRequest request, Long organizationId, Long userId, String userName) {
        // Validate Project
        projectRepository.findById(request.getProjectId())
                .filter(p -> p.getOrganization().getId().equals(organizationId))
                .orElseThrow(() -> new RuntimeException("Project not found or doesn't belong to your organization"));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        String statusStr = (request.getStatus() == null || request.getStatus().isBlank())
                ? "TODO"
                : request.getStatus().toUpperCase();
        task.setStatus(com.flowdesk.enums.TaskStatus.valueOf(statusStr));

        task.setPriority(com.flowdesk.enums.Priority.valueOf(request.getPriority().toUpperCase()));
        task.setProjectId(request.getProjectId());
        task.setAssigneeId(request.getAssigneeId() != null ? request.getAssigneeId() : userId);
        task.setDueDate(request.getDueDate());
        task.setTenantId(organizationId);

        com.flowdesk.entity.Organization org = new com.flowdesk.entity.Organization();
        org.setId(organizationId);
        task.setOrganization(org);

        Task saved = taskRepository.save(task);

        // Log Activity
        activityLogService.log("TASK_CREATED",
                userName + " created task: " + task.getTitle(),
                userId, userName, organizationId, saved.getId(), "TASK");

        return mapToResponse(saved);
    }

    @Override
    public TaskResponse getTaskById(Long id, Long organizationId) {
        return taskRepository.findById(id)
                .filter(t -> t.getOrganization().getId().equals(organizationId))
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @Override
    public List<TaskResponse> getTasksByProjectId(Long projectId, Long organizationId) {
        return taskRepository.findByOrganizationIdAndProjectId(organizationId, projectId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<TaskResponse> getTasksByAssigneeId(Long assigneeId, Long organizationId) {
        return taskRepository.findByAssigneeId(assigneeId).stream()
                .filter(t -> t.getOrganization().getId().equals(organizationId))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TaskResponse updateTask(Long id, TaskCreateRequest request, Long organizationId) {
        Task task = taskRepository.findById(id)
                .filter(t -> t.getOrganization().getId().equals(organizationId))
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        if (request.getStatus() != null) {
            task.setStatus(com.flowdesk.enums.TaskStatus.valueOf(request.getStatus().toUpperCase()));
        }

        task.setPriority(com.flowdesk.enums.Priority.valueOf(request.getPriority().toUpperCase()));
        task.setAssigneeId(request.getAssigneeId());
        task.setDueDate(request.getDueDate());

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    @Override
    public TaskResponse updateTaskStatus(Long id, TaskStatusUpdateRequest request, Long organizationId, Long userId,
            String userName) {
        Task task = taskRepository.findById(id)
                .filter(t -> t.getOrganization().getId().equals(organizationId))
                .orElseThrow(() -> new RuntimeException("Task not found"));

        com.flowdesk.enums.TaskStatus oldStatus = task.getStatus();
        task.setStatus(com.flowdesk.enums.TaskStatus.valueOf(request.getStatus().toUpperCase()));
        Task saved = taskRepository.save(task);

        // Log Activity
        activityLogService.log("TASK_UPDATED",
                userName + " moved task '" + task.getTitle() + "' from " + oldStatus + " to " + saved.getStatus(),
                userId, userName, organizationId, saved.getId(), "TASK");

        return mapToResponse(saved);
    }

    @Override
    public void deleteTask(Long id, Long organizationId, Long userId, String userName) {
        Task task = taskRepository.findById(id)
                .filter(t -> t.getOrganization().getId().equals(organizationId))
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String taskTitle = task.getTitle();
        taskRepository.delete(task);

        // Log Activity
        activityLogService.log("TASK_DELETED",
                userName + " deleted task: " + taskTitle,
                userId, userName, organizationId, id, "TASK");
    }

    private TaskResponse mapToResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus().name());
        response.setPriority(task.getPriority().name());
        response.setProjectId(task.getProjectId());

        if (task.getAssigneeId() != null) {
            userRepository.findById(task.getAssigneeId()).ifPresent(user -> {
                response.setAssignee(new AssigneeDTO(user.getId(), user.getName(), user.getAvatar()));
            });
        }

        response.setDueDate(task.getDueDate());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        return response;
    }
}
