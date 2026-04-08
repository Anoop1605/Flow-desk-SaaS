import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    CheckCircle2,
    AlertCircle,
    Users,
    RefreshCcw,
    Activity
} from 'lucide-react';
import { api, queryKeys } from '../lib/api';
import { fadeUp, staggerContainer } from '../lib/animations';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Real dashboard statistics call for Phase 2
const fetchDashboardStats = async () => {
    const res = await api.get('/api/dashboard');
    return res.data;
};

function StatCard({ title, value, icon: Icon, colorClass, gradientClass, delay = 0 }) {
    return (
        <motion.div
            variants={fadeUp}
            className="relative group overflow-hidden rounded-2xl bg-surface-primary/50 border border-white/[0.08] p-6 hover:bg-surface-primary transition-colors"
        >
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br", gradientClass)} />
            <div className="relative flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
                    <p className="text-3xl font-display font-bold text-white">{value}</p>
                </div>
                <div className={cn("p-3 rounded-xl border", colorClass)}>
                    <Icon size={24} />
                </div>
            </div>
        </motion.div>
    );
}

export default function Dashboard() {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: queryKeys.dashboard,
        queryFn: fetchDashboardStats,
    });

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="skeleton h-10 w-48 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="skeleton h-96 rounded-2xl lg:col-span-2" />
                    <div className="skeleton h-96 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Failed to load dashboard</h2>
                <p className="text-slate-400 mb-6 max-w-md">There was a problem connecting to the server. Please check your connection and try again.</p>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                >
                    <RefreshCcw size={16} /> Try Again
                </button>
            </div>
        );
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-7xl mx-auto"
        >
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">Overview</h1>
                    <p className="text-slate-400 mt-1">Welcome back. Here's what's happening today.</p>
                </div>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Projects"
                    value={data?.totalProjects}
                    icon={LayoutDashboard}
                    colorClass="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                    gradientClass="from-indigo-500"
                />
                <StatCard
                    title="Open Tasks"
                    value={(data?.tasksByStatus.TODO || 0) + (data?.tasksByStatus.IN_PROGRESS || 0)}
                    icon={Activity}
                    colorClass="text-violet-400 bg-violet-500/10 border-violet-500/20"
                    gradientClass="from-violet-500"
                />
                <StatCard
                    title="Overdue Tasks"
                    value={data?.overdueTasks}
                    icon={AlertCircle}
                    colorClass="text-rose-400 bg-rose-500/10 border-rose-500/20"
                    gradientClass="from-rose-500"
                />
                <StatCard
                    title="Team Members"
                    value={data?.teamSize}
                    icon={Users}
                    colorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    gradientClass="from-emerald-500"
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl bg-surface-primary/40 border border-white/[0.08] overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
                        <h2 className="font-semibold text-white">Task Progress</h2>
                    </div>
                    <div className="p-6 h-[300px] flex items-end justify-between gap-4">
                        {/* Placeholder for a beautiful chart. Since no chart library was requested, we use simple CSS bars */}
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                            const height = 40 + Math.random() * 60;
                            return (
                                <div key={day} className="flex flex-col items-center gap-3 w-full group">
                                    <div className="w-full relative h-[200px] rounded-t-lg bg-surface-secondary overflow-hidden">
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">{day}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div variants={fadeUp} className="rounded-2xl bg-surface-primary/40 border border-white/[0.08] flex flex-col">
                    <div className="px-6 py-5 border-b border-white/[0.08] bg-white/[0.02]">
                        <h2 className="font-semibold text-white">Recent Activity</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {data?.recentActivity?.map((activity, i) => (
                            <div key={activity.id} className="flex gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors cursor-default">
                                <div className="mt-1">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-glow-sm ring-4 ring-indigo-500/10" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-300">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
// 3-line usage example:
// import Dashboard from './pages/Dashboard';
// <Route path="/" element={<Dashboard />} />
