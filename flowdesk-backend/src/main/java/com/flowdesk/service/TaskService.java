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

    TaskResponse createTask(TaskCreateRequest request);

    TaskResponse getTaskById(Long id);

    List<TaskResponse> getTasksByProjectId(Long projectId);

    List<TaskResponse> getTasksByAssigneeId(Long assigneeId);

    TaskResponse updateTask(Long id, TaskCreateRequest request);

    TaskResponse updateTaskStatus(Long id, TaskStatusUpdateRequest request);

    void deleteTask(Long id);
}
