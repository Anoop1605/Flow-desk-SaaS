import { useState, useMemo, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { Plus, LayoutGrid } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import RoleGuard from '../components/RoleGuard';
import { MOCK_TASKS } from '../data/mockData';

const COLUMNS = [
    { id: 'TODO', title: 'To Do', color: 'from-blue-500 to-blue-600', dotColor: 'bg-blue-400' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'from-amber-500 to-amber-600', dotColor: 'bg-amber-400' },
    { id: 'DONE', title: 'Done', color: 'from-emerald-500 to-emerald-600', dotColor: 'bg-emerald-400' },
];

// ── Sort tasks: HIGH > MEDIUM > LOW, then by createdAt ──
const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
        const priorityDiff = (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.createdAt) - new Date(b.createdAt);
    });
}

export default function KanbanBoard() {
    const [tasks, setTasks] = useState(MOCK_TASKS);
    const [activeId, setActiveId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalDefaultStatus, setModalDefaultStatus] = useState('TODO');

    // Simulate loading
    useState(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    });

    // ── Group tasks by column ──
    const columns = useMemo(() => {
        const grouped = {};
        COLUMNS.forEach((col) => {
            grouped[col.id] = sortTasks(tasks.filter((t) => t.status === col.id));
        });
        return grouped;
    }, [tasks]);

    // ── DnD Sensors ──
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    // ── Find which column a task lives in ──
    const findColumn = useCallback(
        (id) => {
            for (const [status, items] of Object.entries(columns)) {
                if (items.some((t) => t.id === id)) return status;
            }
            // Check if id is a column id itself
            if (COLUMNS.some((c) => c.id === id)) return id;
            return null;
        },
        [columns]
    );

    // ── Drag Handlers ──
    function handleDragStart(event) {
        setActiveId(event.active.id);
    }

    function handleDragOver(event) {
        const { active, over } = event;
        if (!over) return;

        const activeCol = findColumn(active.id);
        let overCol = findColumn(over.id);

        // If we're dragging over a column header (over.id is a column id)
        if (COLUMNS.some((c) => c.id === over.id)) {
            overCol = over.id;
        }

        if (!activeCol || !overCol || activeCol === overCol) return;

        setTasks((prev) =>
            prev.map((t) => (t.id === active.id ? { ...t, status: overCol } : t))
        );
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeCol = findColumn(active.id);
        let overCol = findColumn(over.id);

        if (COLUMNS.some((c) => c.id === over.id)) {
            overCol = over.id;
        }

        if (activeCol && overCol && activeCol !== overCol) {
            setTasks((prev) =>
                prev.map((t) => (t.id === active.id ? { ...t, status: overCol } : t))
            );
            const task = tasks.find((t) => t.id === active.id);
            const colName = COLUMNS.find((c) => c.id === overCol)?.title;
            toast.success(`"${task?.title}" moved to ${colName}`);
        }
    }

    // ── Add Task ──
    function handleAddTask(newTask) {
        setTasks((prev) => [...prev, newTask]);
        toast.success(`Task "${newTask.title}" created!`);
    }

    function openModal(status) {
        setModalDefaultStatus(status);
        setModalOpen(true);
    }

    const activeTask = tasks.find((t) => t.id === activeId);

    // ── Skeleton Loader ──
    if (isLoading) {
        return (
            <div className="min-h-screen p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="skeleton h-8 w-48 mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-4">
                                <div className="skeleton h-12 w-full rounded-xl" />
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="skeleton h-28 w-full rounded-xl" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-8 fade-in">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
                }}
            />

            <div className="max-w-7xl mx-auto">
                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <LayoutGrid size={22} className="text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-100">Kanban Board</h1>
                            <p className="text-sm text-slate-400">Website Redesign</p>
                        </div>
                    </div>
                </div>

                {/* ── Kanban Columns ── */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {COLUMNS.map((col) => {
                            const colTasks = columns[col.id] || [];
                            return (
                                <div
                                    key={col.id}
                                    className="flex flex-col rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm min-h-[400px]"
                                >
                                    {/* Column Header */}
                                    <div className="px-4 py-3.5 border-b border-slate-700/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                                                <h3 className="text-sm font-semibold text-slate-200">{col.title}</h3>
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-700/80 text-xs font-bold text-slate-300">
                                                    {colTasks.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tasks */}
                                    <SortableContext
                                        items={colTasks.map((t) => t.id)}
                                        strategy={verticalListSortingStrategy}
                                        id={col.id}
                                    >
                                        <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
                                            {colTasks.map((task) => (
                                                <TaskCard key={task.id} task={task} />
                                            ))}
                                        </div>
                                    </SortableContext>

                                    {/* Add Task Button */}
                                    <div className="px-3 pb-3">
                                        <button
                                            onClick={() => openModal(col.id)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-600 text-sm text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
                                        >
                                            <Plus size={16} />
                                            Add Task
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Drag Overlay */}
                    <DragOverlay>
                        {activeTask ? (
                            <div className="opacity-90 rotate-2 scale-105">
                                <TaskCard task={activeTask} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleAddTask}
                defaultStatus={modalDefaultStatus}
            />
        </div>
    );
}
