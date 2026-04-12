package com.flowdesk.service;

import com.flowdesk.dto.TaskCreateRequest;
import com.flowdesk.dto.TaskResponse;
import com.flowdesk.dto.TaskStatusUpdateRequest;
import com.flowdesk.entity.Organization;
import com.flowdesk.entity.Task;
import com.flowdesk.enums.Priority;
import com.flowdesk.enums.TaskStatus;
import com.flowdesk.entity.Project;
import com.flowdesk.repository.ProjectRepository;
import com.flowdesk.repository.TaskRepository;
import com.flowdesk.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.ArgumentCaptor;

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
    private ProjectRepository projectRepository;

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
        request.setPriority("high");
        request.setStatus("todo");
        request.setProjectId(1L);

        Task savedTask = new Task();
        savedTask.setId(100L);
        savedTask.setTitle("New Task");
        savedTask.setStatus(TaskStatus.TODO);
        savedTask.setPriority(Priority.HIGH);

        Project project = new Project();
        Organization org = new Organization();
        org.setId(1L);
        project.setOrganization(org);

        savedTask.setOrganization(org);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        TaskResponse response = taskService.createTask(request, 1L, 1L, "Admin");

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("New Task", response.getTitle());
        ArgumentCaptor<Task> savedTaskCaptor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(savedTaskCaptor.capture());
        assertEquals(1L, savedTaskCaptor.getValue().getAssigneeId());
        assertEquals(TaskStatus.TODO, savedTaskCaptor.getValue().getStatus());
        assertEquals(Priority.HIGH, savedTaskCaptor.getValue().getPriority());
        verify(activityLogService, times(1)).log(anyString(), anyString(), anyLong(), anyString(), anyLong(), anyLong(),
                anyString());
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
        assertThrows(RuntimeException.class,
                () -> taskService.updateTaskStatus(taskId, updateRequest, otherOrgId, 1L, "Admin"));

        // Attempt update with RIGHT orgId
        TaskResponse response = taskService.updateTaskStatus(taskId, updateRequest, orgId, 1L, "Admin");
        assertEquals("IN_PROGRESS", response.getStatus());
    }
}
