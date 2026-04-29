package com.flowdesk.service;

import com.flowdesk.dto.TaskCreateRequest;
import com.flowdesk.dto.TaskResponse;
import com.flowdesk.dto.TaskStatusUpdateRequest;

import java.util.List;

/**
 * Service interface for Task operations.
 * Phase 1: empty implementation.
 * Phase 2: fully implemented with JPA persistence.
 */
public interface TaskService {

    TaskResponse createTask(TaskCreateRequest request, Long organizationId, Long userId, String userName);

    TaskResponse getTaskById(Long id, Long organizationId);

    List<TaskResponse> getTasksByProjectId(Long projectId, Long organizationId);

    List<TaskResponse> getTasksByAssigneeId(Long assigneeId, Long organizationId);

    TaskResponse updateTask(Long id, TaskCreateRequest request, Long organizationId);

    TaskResponse updateTaskStatus(Long id, TaskStatusUpdateRequest request, Long organizationId, Long userId, String userName);

    void deleteTask(Long id, Long organizationId, Long userId, String userName);
}
