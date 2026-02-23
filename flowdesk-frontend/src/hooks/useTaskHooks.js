import { useState, useEffect } from 'react';
import { MOCK_TASKS, MOCK_DASHBOARD } from '../data/mockData';

/**
 * Custom hook to fetch tasks by project ID.
 * Phase 1: returns mock data. Phase 2: will call GET /api/tasks?projectId=X
 */
export function useTasksByProject(projectId) {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        // Simulate API delay
        const timer = setTimeout(() => {
            const filtered = MOCK_TASKS.filter((t) => t.projectId === Number(projectId));
            setTasks(filtered);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [projectId]);

    return { tasks, setTasks, isLoading, error };
}

/**
 * Custom hook for dashboard data.
 * Phase 1: returns mock data. Phase 2: will call GET /api/dashboard
 */
export function useDashboard() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    function fetchDashboard() {
        setIsLoading(true);
        setError(null);
        setTimeout(() => {
            setData(MOCK_DASHBOARD);
            setIsLoading(false);
        }, 500);
    }

    useEffect(() => {
        fetchDashboard();
    }, []);

    return { data, isLoading, error, refetch: fetchDashboard };
}

/**
 * Custom hook for comments on a task.
 * Phase 1: returns empty array (no comments UI in Phase 1).
 * Phase 2: will call GET /api/tasks/{taskId}/comments
 */
export function useComments(taskId) {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!taskId) return;
        setIsLoading(true);
        setTimeout(() => {
            setComments([]);
            setIsLoading(false);
        }, 300);
    }, [taskId]);

    return { comments, setComments, isLoading, error };
}
