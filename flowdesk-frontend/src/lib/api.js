import axios from 'axios';

/**
 * Shared Axios API configuration
 * Points to the Spring Boot backend
 */
export const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Query keys for easy reference across the app
export const queryKeys = {
    dashboard: ['dashboard'],
    tasks: (projectId) => ['tasks', projectId],
    myTasks: ['my-tasks'],
    comments: (taskId) => ['comments', taskId],
};
