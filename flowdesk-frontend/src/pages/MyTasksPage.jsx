import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    CheckSquare, Search, CalendarClock, AlertCircle,
    CircleDot, CheckCircle2, Clock, ListTodo
} from 'lucide-react';
import { fadeUp, staggerContainer, cardVariant } from '../lib/animations';
import { cn } from '../lib/utils';
import { queryKeys, taskApi } from '../lib/api';
import { useUIStore } from '../stores/uiStore';
import { formatDistanceToNow, isPast } from 'date-fns';

const STATUS_TABS = [
    { id: 'ALL', label: 'All Tasks', icon: ListTodo },
    { id: 'TODO', label: 'To Do', icon: CircleDot },
    { id: 'IN_PROGRESS', label: 'In Progress', icon: Clock },
    { id: 'DONE', label: 'Done', icon: CheckCircle2 },
];

const priorityConfig = {
    HIGH: { className: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    MEDIUM: { className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    LOW: { className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const statusConfig = {
    TODO: { label: 'To Do', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    DONE: { label: 'Done', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

export default function MyTasksPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const openTask = useUIStore(s => s.openTask);

    const { data: myTasks = [], isLoading } = useQuery({
        queryKey: queryKeys.myTasks,
        queryFn: async () => {
            const res = await taskApi.getMine();
            return res.data;
        },
    });

    // Apply filters
    const filtered = useMemo(() => {
        return myTasks.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = activeTab === 'ALL' || t.status === activeTab;
            return matchesSearch && matchesStatus;
        });
    }, [myTasks, searchQuery, activeTab]);

    // Stats
    const stats = useMemo(() => ({
        total: myTasks.length,
        todo: myTasks.filter(t => t.status === 'TODO').length,
        inProgress: myTasks.filter(t => t.status === 'IN_PROGRESS').length,
        done: myTasks.filter(t => t.status === 'DONE').length,
        overdue: myTasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'DONE').length,
    }), [myTasks]);

    if (isLoading) {
        return (
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="skeleton h-10 w-48 rounded-lg" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-5xl mx-auto"
        >
            {/* Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">My Tasks</h1>
                    <p className="text-slate-400 mt-1">Track and manage all tasks assigned to you</p>
                </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-primary/50 border border-white/[0.08]">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <CircleDot size={18} />
                    </div>
                    <div>
                        <p className="text-xl font-display font-bold text-white">{stats.todo}</p>
                        <p className="text-[11px] text-slate-500">To Do</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-primary/50 border border-white/[0.08]">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock size={18} />
                    </div>
                    <div>
                        <p className="text-xl font-display font-bold text-white">{stats.inProgress}</p>
                        <p className="text-[11px] text-slate-500">In Progress</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-primary/50 border border-white/[0.08]">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={18} />
                    </div>
                    <div>
                        <p className="text-xl font-display font-bold text-white">{stats.done}</p>
                        <p className="text-[11px] text-slate-500">Done</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-primary/50 border border-white/[0.08]">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <p className="text-xl font-display font-bold text-white">{stats.overdue}</p>
                        <p className="text-[11px] text-slate-500">Overdue</p>
                    </div>
                </div>
            </motion.div>

            {/* Filter Tabs + Search */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-primary/50 border border-white/[0.08]">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                                activeTab === tab.id
                                    ? "bg-indigo-500/15 text-indigo-300 shadow-sm"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={13} />
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search my tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-secondary border border-white/[0.08] text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 transition-colors"
                    />
                </div>
            </motion.div>

            {/* Task List */}
            {filtered.length === 0 ? (
                <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
                        <CheckSquare size={28} className="text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No tasks found</h3>
                    <p className="text-slate-400 text-sm max-w-md">
                        {searchQuery || activeTab !== 'ALL'
                            ? "Try adjusting your search or filter to find what you're looking for."
                            : "You don't have any tasks assigned yet. Tasks assigned to you will appear here."}
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={staggerContainer} className="space-y-3">
                    {filtered.map((task) => {
                        const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';
                        const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
                        const status = statusConfig[task.status] || statusConfig.TODO;

                        return (
                            <motion.div
                                key={task.id}
                                variants={cardVariant}
                                onClick={() => openTask(task.id)}
                                className="group relative flex items-center gap-5 px-5 py-4 rounded-2xl bg-surface-primary/50 border border-white/[0.06] hover:bg-surface-primary hover:border-white/[0.12] transition-all duration-300 cursor-pointer"
                            >
                                {/* Priority dot */}
                                <div className={cn(
                                    "w-2.5 h-2.5 rounded-full flex-shrink-0 ring-4",
                                    task.priority === 'HIGH' ? "bg-rose-400 ring-rose-500/10" :
                                    task.priority === 'MEDIUM' ? "bg-amber-400 ring-amber-500/10" :
                                    "bg-slate-400 ring-slate-500/10"
                                )} />

                                {/* Task Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                                            {task.title}
                                        </h4>
                                        {isOverdue && (
                                            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 flex-shrink-0">
                                                <AlertCircle size={9} /> Overdue
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span className="truncate">{task.projectName || `Project #${task.projectId}`}</span>
                                        <span className="text-slate-600">•</span>
                                        <span className="flex items-center gap-1">
                                            <CalendarClock size={11} className={isOverdue ? "text-rose-400" : ""} />
                                            <span className={isOverdue ? "text-rose-400" : ""}>
                                                {task.dueDate ? formatDistanceToNow(new Date(task.dueDate), { addSuffix: true }) : 'No due date'}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                {/* Status & Priority Badges */}
                                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                                    <span className={cn('inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium rounded-full border', priority.className)}>
                                        {task.priority}
                                    </span>
                                    <span className={cn('inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium rounded-full border', status.className)}>
                                        {status.label}
                                    </span>
                                </div>

                                {/* Assignee Avatar */}
                                {task.assignee && (
                                    <div
                                        className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-surface-primary flex-shrink-0"
                                        title={task.assignee.name}
                                    >
                                        {task.assignee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
}
