import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import {
    ArrowLeft, Users, CheckSquare, Settings, LayoutDashboard,
    KanbanSquare, Calendar, MoreHorizontal, Mail, Shield
} from 'lucide-react';
import { queryKeys } from '../lib/api';
import { fadeUp, staggerContainer } from '../lib/animations';
import { cn } from '../lib/utils';
import { MOCK_PROJECTS, MOCK_PROJECT_MEMBERS } from '../data/mockData';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
    ACTIVE: { label: 'Active', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    ON_HOLD: { label: 'On Hold', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    COMPLETED: { label: 'Completed', className: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
    ARCHIVED: { label: 'Archived', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

const roleConfig = {
    MANAGER: { label: 'Manager', className: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
    MEMBER: { label: 'Member', className: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
};

// Phase 1: mock fetchers
const fetchProject = async (id) => {
    await new Promise((r) => setTimeout(r, 500));
    return MOCK_PROJECTS.find(p => p.id === Number(id)) || MOCK_PROJECTS[0];
};

const fetchProjectMembers = async () => {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_PROJECT_MEMBERS;
};

function StatMini({ icon: Icon, label, value, colorClass }) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-secondary/50 border border-white/[0.06]">
            <div className={cn('p-2 rounded-lg', colorClass)}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-lg font-semibold text-white">{value}</p>
            </div>
        </div>
    );
}

export default function ProjectDetailPage() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('overview');

    const { data: project, isLoading: projectLoading } = useQuery({
        queryKey: queryKeys.project(id),
        queryFn: () => fetchProject(id),
    });

    const { data: members, isLoading: membersLoading } = useQuery({
        queryKey: queryKeys.projectMembers(id),
        queryFn: () => fetchProjectMembers(),
    });

    if (projectLoading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="skeleton h-8 w-40 rounded-lg" />
                <div className="skeleton h-32 rounded-2xl" />
                <div className="skeleton h-96 rounded-2xl" />
            </div>
        );
    }

    const status = statusConfig[project?.status] || statusConfig.ACTIVE;

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-5xl mx-auto"
        >
            {/* Back + Header */}
            <motion.div variants={fadeUp}>
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft size={16} />
                    Back to Projects
                </Link>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-display font-bold shadow-glow-sm"
                            style={{ backgroundColor: project?.colorTag + '20', color: project?.colorTag }}
                        >
                            {project?.name?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                                {project?.name}
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={cn('inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border', status.className)}>
                                    {status.label}
                                </span>
                                <span className="text-xs text-slate-500">
                                    Created {project?.createdAt && formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Link
                        to={`/projects/${id}/board`}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-glow-sm"
                    >
                        <KanbanSquare size={16} />
                        Open Board
                    </Link>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={fadeUp}>
                <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                    <Tabs.List className="flex gap-1 border-b border-white/[0.08] mb-6">
                        {[
                            { value: 'overview', label: 'Overview', icon: LayoutDashboard },
                            { value: 'tasks', label: 'Tasks', icon: CheckSquare },
                            { value: 'members', label: 'Members', icon: Users },
                            { value: 'settings', label: 'Settings', icon: Settings },
                        ].map((tab) => (
                            <Tabs.Trigger
                                key={tab.value}
                                value={tab.value}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-[1px]",
                                    activeTab === tab.value
                                        ? "text-indigo-400 border-indigo-500"
                                        : "text-slate-400 border-transparent hover:text-slate-200 hover:border-white/20"
                                )}
                            >
                                <tab.icon size={15} />
                                {tab.label}
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>

                    {/* Overview Tab */}
                    <Tabs.Content value="overview" className="space-y-6">
                        <div className="rounded-2xl bg-surface-primary/40 border border-white/[0.08] p-6">
                            <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                            <p className="text-white leading-relaxed">{project?.description}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatMini icon={Users} label="Members" value={project?.memberCount} colorClass="bg-indigo-500/10 text-indigo-400" />
                            <StatMini icon={CheckSquare} label="Tasks" value={project?.taskCount} colorClass="bg-violet-500/10 text-violet-400" />
                            <StatMini icon={Calendar} label="Status" value={status.label} colorClass="bg-emerald-500/10 text-emerald-400" />
                            <StatMini icon={Shield} label="Owner" value={project?.ownerName?.split(' ')[0]} colorClass="bg-amber-500/10 text-amber-400" />
                        </div>
                    </Tabs.Content>

                    {/* Tasks Tab */}
                    <Tabs.Content value="tasks" className="space-y-6">
                        <div className="rounded-2xl bg-surface-primary/40 border border-white/[0.08] p-8 text-center">
                            <KanbanSquare size={40} className="text-slate-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">View tasks on the Kanban Board</h3>
                            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                                Tasks for this project are managed on the Kanban board with drag-and-drop status updates.
                            </p>
                            <Link
                                to={`/projects/${id}/board`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                            >
                                <KanbanSquare size={16} />
                                Open Kanban Board
                            </Link>
                        </div>
                    </Tabs.Content>

                    {/* Members Tab */}
                    <Tabs.Content value="members" className="space-y-6">
                        <div className="rounded-2xl bg-surface-primary/40 border border-white/[0.08] overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                                <h3 className="font-semibold text-white">Team Members</h3>
                                <span className="text-xs text-slate-500">{members?.length || 0} members</span>
                            </div>
                            <div className="divide-y divide-white/[0.06]">
                                {membersLoading ? (
                                    [1, 2, 3].map(i => <div key={i} className="skeleton h-16 m-2 rounded-lg" />)
                                ) : (
                                    (members || []).map((member) => {
                                        const role = roleConfig[member.roleInProject] || roleConfig.MEMBER;
                                        return (
                                            <div key={member.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-medium text-white">
                                                        {member.userName.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{member.userName}</p>
                                                        <p className="text-xs text-slate-500">{member.userEmail}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={cn('inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium rounded-full border', role.className)}>
                                                        {role.label}
                                                    </span>
                                                    <span className="text-xs text-slate-500 hidden sm:block">
                                                        Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </Tabs.Content>

                    {/* Settings Tab */}
                    <Tabs.Content value="settings" className="space-y-6">
                        <div className="rounded-2xl bg-surface-primary/40 border border-white/[0.08] p-6 space-y-5">
                            <h3 className="font-semibold text-white">Project Settings</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Name</label>
                                    <input
                                        type="text"
                                        defaultValue={project?.name}
                                        className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-white/[0.08] text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                                    <textarea
                                        defaultValue={project?.description}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-white/[0.08] text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 transition-colors resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                                    <select
                                        defaultValue={project?.status}
                                        className="appearance-none w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-white/[0.08] text-sm text-slate-300 cursor-pointer hover:bg-surface-tertiary transition-colors"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="ON_HOLD">On Hold</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="ARCHIVED">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <button className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-glow-sm">
                                Save Changes
                            </button>
                        </div>

                        {/* Danger Zone */}
                        <div className="rounded-2xl bg-rose-500/5 border border-rose-500/20 p-6">
                            <h3 className="font-semibold text-rose-400 mb-2">Danger Zone</h3>
                            <p className="text-sm text-slate-400 mb-4">Once you delete a project, there is no going back. Please be certain.</p>
                            <button className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-400 text-sm font-medium hover:bg-rose-500/10 transition-colors">
                                Delete Project
                            </button>
                        </div>
                    </Tabs.Content>
                </Tabs.Root>
            </motion.div>
        </motion.div>
    );
}
