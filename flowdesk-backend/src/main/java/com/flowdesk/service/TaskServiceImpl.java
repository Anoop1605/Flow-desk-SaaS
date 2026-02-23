package com.flowdesk.service;

import com.flowdesk.dto.TaskCreateRequest;
import com.flowdesk.dto.TaskResponse;
import com.flowdesk.dto.TaskStatusUpdateRequest;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Phase 1: Empty / stub implementation of TaskService.
 * All methods return null or empty collections.
 * Will be fully implemented in Phase 2.
 */
@Service
public class TaskServiceImpl implements TaskService {

    @Override
    public TaskResponse createTask(TaskCreateRequest request) {
        // TODO: Phase 2 — persist to database
        return null;
    }

    @Override
    public TaskResponse getTaskById(Long id) {
        // TODO: Phase 2 — fetch from database
        return null;
    }

    @Override
    public List<TaskResponse> getTasksByProjectId(Long projectId) {
        // TODO: Phase 2 — query by projectId
        return Collections.emptyList();
    }

    @Override
    public List<TaskResponse> getTasksByAssigneeId(Long assigneeId) {
        // TODO: Phase 2 — query by assigneeId
        return Collections.emptyList();
    }

    @Override
    public TaskResponse updateTask(Long id, TaskCreateRequest request) {
        // TODO: Phase 2 — update entity
        return null;
    }

    @Override
    public TaskResponse updateTaskStatus(Long id, TaskStatusUpdateRequest request) {
        // TODO: Phase 2 — update status field only
        return null;
    }

    @Override
    public void deleteTask(Long id) {
        // TODO: Phase 2 — delete from database
    }
}
