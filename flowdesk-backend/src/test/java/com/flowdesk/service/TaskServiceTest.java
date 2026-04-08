package com.flowdesk.service;

import com.flowdesk.dto.TaskCreateRequest;
import com.flowdesk.dto.TaskResponse;
import com.flowdesk.dto.TaskStatusUpdateRequest;
import com.flowdesk.entity.Organization;
import com.flowdesk.entity.Task;
import com.flowdesk.enums.Priority;
import com.flowdesk.enums.TaskStatus;
import com.flowdesk.repository.TaskRepository;
import com.flowdesk.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private TaskServiceImpl taskService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateTask() {
        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle("New Task");
        request.setPriority("HIGH");
        request.setProjectId(1L);

        Task savedTask = new Task();
        savedTask.setId(100L);
        savedTask.setTitle("New Task");
        savedTask.setStatus(TaskStatus.TODO);
        savedTask.setPriority(Priority.HIGH);
        Organization org = new Organization();
        org.setId(1L);
        savedTask.setOrganization(org);

        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        TaskResponse response = taskService.createTask(request, 1L, 1L, "Admin");

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("New Task", response.getTitle());
        verify(activityLogService, times(1)).log(anyString(), anyString(), anyLong(), anyString(), anyLong(), anyLong(), anyString());
    }

    @Test
    void testUpdateTaskStatus_TenantIsolation() {
        Long taskId = 100L;
        Long orgId = 1L;
        Long otherOrgId = 2L;

        Task task = new Task();
        task.setId(taskId);
        Organization org = new Organization();
        org.setId(orgId);
        task.setOrganization(org);
        task.setStatus(TaskStatus.TODO);

        TaskStatusUpdateRequest updateRequest = new TaskStatusUpdateRequest();
        updateRequest.setStatus("IN_PROGRESS");

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArguments()[0]);

        // Attempt update with WRONG orgId
        assertThrows(RuntimeException.class, () -> 
            taskService.updateTaskStatus(taskId, updateRequest, otherOrgId, 1L, "Admin")
        );

        // Attempt update with RIGHT orgId
        TaskResponse response = taskService.updateTaskStatus(taskId, updateRequest, orgId, 1L, "Admin");
        assertEquals("IN_PROGRESS", response.getStatus());
    }
}
