import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, LayoutGrid, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { TaskCard } from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import RoleGuard from '../components/RoleGuard';
import { api, queryKeys, taskApi } from '../lib/api';
import { cn } from '../lib/utils';
import { fadeUp } from '../lib/animations';

const COLUMNS = [
    { id: 'TODO', title: 'To Do', borderClass: 'border-blue-500/30', headerClass: 'bg-blue-500/10 text-blue-400' },
    { id: 'IN_PROGRESS', title: 'In Progress', borderClass: 'border-amber-500/30', headerClass: 'bg-amber-500/10 text-amber-400' },
    { id: 'DONE', title: 'Done', borderClass: 'border-emerald-500/30', headerClass: 'bg-emerald-500/10 text-emerald-400' },
];

export default function KanbanBoard() {
    const { id: projectId } = useParams();
    const queryClient = useQueryClient();

    const [activeTask, setActiveTask] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalDefaultStatus, setModalDefaultStatus] = useState('TODO');

    // ── Fetch tasks from Spring Boot Backend ──
    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: queryKeys.tasks(projectId),
        queryFn: async () => {
            const res = await taskApi.getAll(projectId);
            return res.data;
        },
        enabled: !!projectId
    });

    // ── Flatten tasks for local state (Optimistic Updates) ──
    // Because the API returns { tasks: { TODO: [...], IN_PROGRESS: [...] } }
    // we flatten it to a single array for easier DnD tracking.
    const [localTasks, setLocalTasks] = useState([]);

    // Sync local state when API data changes
    useMemo(() => {
        if (responseData?.tasks) {
            const all = [
                ...(responseData.tasks.TODO || []),
                ...(responseData.tasks.IN_PROGRESS || []),
                ...(responseData.tasks.DONE || [])
            ];
            setLocalTasks(all);
        }
    }, [responseData]);

    // ── Group tasks by column ──
    const columns = useMemo(() => {
        const grouped = { TODO: [], IN_PROGRESS: [], DONE: [] };
        localTasks.forEach(t => {
            if (grouped[t.status]) {
                grouped[t.status].push(t);
            }
        });
        return grouped;
    }, [localTasks]);

    // ── DnD Sensors ──
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const findColumn = useCallback((id) => {
        const task = localTasks.find(t => t.id === id);
        if (task) return task.status;
        if (['TODO', 'IN_PROGRESS', 'DONE'].includes(id)) return id;
        return null;
    }, [localTasks]);

    // ── Drag Handlers ──
    const handleDragStart = useCallback((event) => {
        const task = localTasks.find(t => t.id === event.active.id);
        setActiveTask(task);
    }, [localTasks]);

    const handleDragOver = useCallback((event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeCol = findColumn(activeId);
        const overCol = findColumn(overId);

        if (!activeCol || !overCol || activeCol === overCol) return;

        setLocalTasks(prev =>
            prev.map(t => t.id === activeId ? { ...t, status: overCol } : t)
        );
    }, [findColumn]);

    // ── Persistence Mutations ──
    const updateStatusMutation = useMutation({
        mutationFn: ({ taskId, newStatus }) => taskApi.updateStatus(taskId, newStatus),
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.tasks(projectId));
        },
        onError: (err) => {
            toast.error("Failed to update task status");
            console.error(err);
            // Revert local state on error
            queryClient.invalidateQueries(queryKeys.tasks(projectId));
        }
    });

    const createTaskMutation = useMutation({
        mutationFn: (taskData) => taskApi.create({ ...taskData, projectId: parseInt(projectId) }),
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.tasks(projectId));
            toast.success("Task created successfully");
        },
        onError: (err) => {
            toast.error("Failed to create task");
            console.error(err);
        }
    });

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        setActiveTask(null);
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeCol = findColumn(activeId);
        const overCol = findColumn(overId);

        if (activeCol && overCol && activeCol !== overCol) {
            // Optimistic UI update
            setLocalTasks(prev =>
                prev.map(t => t.id === activeId ? { ...t, status: overCol } : t)
            );
            
            // Persist to DB
            updateStatusMutation.mutate({ taskId: activeId, newStatus: overCol });
            
            const task = localTasks.find(t => t.id === activeId);
            toast.success(`Moved to ${COLUMNS.find(c => c.id === overCol)?.title}`, {
                description: task.title
            });
        }
    }, [findColumn, localTasks, updateStatusMutation, projectId]);

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: '0.5' } },
        }),
    };

    if (isLoading) {
        return (
            <div className="p-6 md:p-8 space-y-8">
                <div className="skeleton h-10 w-64 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton h-[500px] rounded-2xl border border-white/5" />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center">
                <p className="text-rose-400 mb-4">Failed to load tasks from backend.</p>
                <button onClick={() => queryClient.invalidateQueries(queryKeys.tasks(projectId))} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <LayoutGrid size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-white tracking-tight">{responseData?.projectName || (projectId ? `Project #${projectId}` : 'Project Board')}</h1>
                        <p className="text-sm text-slate-400 mt-1">Manage and track your tasks</p>
                    </div>
                </div>
            </motion.div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {COLUMNS.map((col) => {
                        const colTasks = columns[col.id];
                        return (
                            <div key={col.id} className="flex flex-col rounded-2xl bg-surface-primary/40 border border-white/[0.04] backdrop-blur-xl">
                                <div className={cn("px-4 py-3 border-b border-white/[0.04] flex items-center justify-between", col.headerClass, "rounded-t-2xl bg-opacity-50")}>
                                    <h3 className="text-sm font-semibold tracking-wide uppercase">{col.title}</h3>
                                    <span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-xs font-bold text-white">
                                        {colTasks.length}
                                    </span>
                                </div>

                                <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                    <div className="flex-1 p-3 min-h-[500px] flex flex-col gap-3">
                                        {colTasks.map((task) => (
                                            <TaskCard key={task.id} task={task} />
                                        ))}

                                        <RoleGuard allowedRoles={['ORGANIZATION_OWNER', 'ORGANIZATION_MEMBER']}>
                                            <button
                                                onClick={() => {
                                                    setModalDefaultStatus(col.id);
                                                    setModalOpen(true);
                                                }}
                                                className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 text-sm font-medium text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all group"
                                            >
                                                <Plus size={16} className="group-hover:scale-110 transition-transform" /> Add Task
                                            </button>
                                        </RoleGuard>
                                    </div>
                                </SortableContext>
                            </div>
                        );
                    })}
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeTask ? <TaskCard task={activeTask} overlay /> : null}
                </DragOverlay>
            </DndContext>

            {/* Create Task Modal - We will refactor this to Radix Dialog next */}
            <CreateTaskModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={(t) => createTaskMutation.mutate(t)}
                defaultStatus={modalDefaultStatus}
            />
        </div>
    );
}
