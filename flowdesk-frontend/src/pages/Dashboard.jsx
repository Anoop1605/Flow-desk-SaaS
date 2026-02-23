import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    AlertTriangle,
    Users,
    Activity,
    Clock,
    FileText,
    MessageSquare,
    UserPlus,
    RefreshCw,
} from 'lucide-react';
import { MOCK_DASHBOARD } from '../data/mockData';

// ── Activity icon mapping ──
const ACTIVITY_ICONS = {
    TASK_CREATED: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    STATUS_CHANGED: { icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    COMMENT_ADDED: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    TASK_ASSIGNED: { icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

// ── Format timestamp ──
function formatTimestamp(ts) {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    function fetchDashboard() {
        setIsLoading(true);
        setError(false);
        // Simulate API delay
        setTimeout(() => {
            setData(MOCK_DASHBOARD);
            setIsLoading(false);
        }, 600);
    }

    useEffect(() => {
        fetchDashboard();
    }, []);

    // ── Stat Cards config ──
    const statCards = data
        ? [
            {
                label: 'Total Projects',
                value: data.totalProjects,
                icon: FolderKanban,
                gradient: 'from-indigo-500 to-indigo-600',
                iconBg: 'bg-indigo-500/15',
                iconColor: 'text-indigo-400',
            },
            {
                label: 'Open Tasks',
                value: data.tasksByStatus.TODO + data.tasksByStatus.IN_PROGRESS,
                icon: CheckSquare,
                gradient: 'from-blue-500 to-blue-600',
                iconBg: 'bg-blue-500/15',
                iconColor: 'text-blue-400',
            },
            {
                label: 'Overdue Tasks',
                value: data.overdueTasks,
                icon: AlertTriangle,
                gradient: 'from-red-500 to-red-600',
                iconBg: 'bg-red-500/15',
                iconColor: 'text-red-400',
            },
            {
                label: 'Team Size',
                value: data.teamSize,
                icon: Users,
                gradient: 'from-emerald-500 to-emerald-600',
                iconBg: 'bg-emerald-500/15',
                iconColor: 'text-emerald-400',
            },
        ]
        : [];

    // ── Skeleton ──
    if (isLoading) {
        return (
            <div className="min-h-screen p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="skeleton h-8 w-48 mb-8" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="skeleton h-28 rounded-xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="skeleton h-80 rounded-xl" />
                        <div className="skeleton h-80 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Error State ──
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle size={28} className="text-red-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-200 mb-2">Failed to load dashboard</h2>
                    <p className="text-sm text-slate-400 mb-6">Something went wrong. Please try again.</p>
                    <button
                        onClick={fetchDashboard}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-8 fade-in">
            <div className="max-w-7xl mx-auto">
                {/* ── Header ── */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <LayoutDashboard size={22} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
                        <p className="text-sm text-slate-400">Project overview & activity</p>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={idx}
                                className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm p-5 transition-all duration-200 hover:border-slate-600 hover:shadow-lg card-glow group"
                            >
                                {/* Gradient accent on top */}
                                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.gradient}`} />

                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">{card.label}</p>
                                        <p className="text-3xl font-extrabold text-slate-100">{card.value}</p>
                                    </div>
                                    <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                                        <Icon size={22} className={card.iconColor} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Activity + Overdue Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                            <Activity size={18} className="text-indigo-400" />
                            <h2 className="text-base font-semibold text-slate-200">Recent Activity</h2>
                        </div>
                        <div className="divide-y divide-slate-700/40 max-h-[360px] overflow-y-auto">
                            {data.recentActivity.map((event, idx) => {
                                const actConfig = ACTIVITY_ICONS[event.type] || ACTIVITY_ICONS.TASK_CREATED;
                                const ActIcon = actConfig.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-700/20 transition-colors"
                                    >
                                        <div className={`p-1.5 rounded-lg ${actConfig.bg} mt-0.5`}>
                                            <ActIcon size={14} className={actConfig.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-200 leading-snug">
                                                <span className="font-medium">{event.actorName}</span>{' '}
                                                <span className="text-slate-400">
                                                    {event.type === 'TASK_CREATED' && 'created'}
                                                    {event.type === 'STATUS_CHANGED' && 'updated status of'}
                                                    {event.type === 'COMMENT_ADDED' && 'commented on'}
                                                    {event.type === 'TASK_ASSIGNED' && 'assigned'}
                                                </span>{' '}
                                                <span className="text-slate-300">"{event.taskTitle}"</span>
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                <Clock size={10} /> {formatTimestamp(event.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Overdue Tasks Panel */}
                    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-400" />
                            <h2 className="text-base font-semibold text-slate-200">Overdue Tasks</h2>
                            <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-red-500/15 text-xs font-bold text-red-400">
                                {data.overdueTasksList.length}
                            </span>
                        </div>
                        <div className="divide-y divide-slate-700/40">
                            {data.overdueTasksList.map((task) => (
                                <div
                                    key={task.id}
                                    className="px-5 py-4 hover:bg-slate-700/20 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-1.5">
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{task.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{task.projectName}</p>
                                        </div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-500/10 text-xs font-semibold text-red-400 whitespace-nowrap">
                                            {task.daysOverdue} day{task.daysOverdue !== 1 ? 's' : ''} overdue
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white">
                                            {task.assignee.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')}
                                        </div>
                                        <span className="text-xs text-slate-400">{task.assignee.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Task Status Breakdown ── */}
                <div className="mt-6 rounded-xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Tasks by Status</h3>
                    <div className="flex gap-3 h-3 rounded-full overflow-hidden bg-slate-700/50">
                        <div
                            className="bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${(data.tasksByStatus.TODO / data.totalTasks) * 100}%` }}
                            title={`To Do: ${data.tasksByStatus.TODO}`}
                        />
                        <div
                            className="bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${(data.tasksByStatus.IN_PROGRESS / data.totalTasks) * 100}%` }}
                            title={`In Progress: ${data.tasksByStatus.IN_PROGRESS}`}
                        />
                        <div
                            className="bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${(data.tasksByStatus.DONE / data.totalTasks) * 100}%` }}
                            title={`Done: ${data.tasksByStatus.DONE}`}
                        />
                    </div>
                    <div className="flex items-center gap-6 mt-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span className="text-xs text-slate-400">To Do ({data.tasksByStatus.TODO})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="text-xs text-slate-400">In Progress ({data.tasksByStatus.IN_PROGRESS})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-xs text-slate-400">Done ({data.tasksByStatus.DONE})</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
