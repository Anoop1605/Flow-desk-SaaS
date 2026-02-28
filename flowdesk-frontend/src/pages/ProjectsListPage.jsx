import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Search, Users, CheckSquare, FolderKanban,
    MoreHorizontal, ArrowUpRight, Filter
} from 'lucide-react';
import { queryKeys } from '../lib/api';
import { fadeUp, staggerContainer, cardVariant } from '../lib/animations';
import { cn } from '../lib/utils';
import { MOCK_PROJECTS } from '../data/mockData';
import CreateProjectModal from '../components/CreateProjectModal';
import RoleGuard from '../components/RoleGuard';

// Status badge styling
const statusConfig = {
    ACTIVE: { label: 'Active', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    ON_HOLD: { label: 'On Hold', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    COMPLETED: { label: 'Completed', className: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
    ARCHIVED: { label: 'Archived', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

// Phase 1: mock fetch
const fetchProjects = async () => {
    await new Promise((r) => setTimeout(r, 600));
    return MOCK_PROJECTS;
};

function ProjectCard({ project }) {
    const status = statusConfig[project.status] || statusConfig.ACTIVE;

    return (
        <motion.div variants={cardVariant}>
            <Link
                to={`/projects/${project.id}`}
                className="group relative block rounded-2xl bg-surface-primary/50 border border-white/[0.08] p-6 hover:bg-surface-primary hover:border-white/[0.12] transition-all duration-300"
            >
                {/* Color accent bar */}
                <div
                    className="absolute top-0 left-6 right-6 h-0.5 rounded-b-full opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: project.colorTag }}
                />

                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-bold text-sm shadow-glow-sm"
                            style={{ backgroundColor: project.colorTag + '20', color: project.colorTag }}
                        >
                            {project.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-base group-hover:text-indigo-300 transition-colors">
                                {project.name}
                            </h3>
                            <span className={cn('inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border mt-1', status.className)}>
                                {status.label}
                            </span>
                        </div>
                    </div>
                    <ArrowUpRight
                        size={16}
                        className="text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-indigo-400 transition-all duration-300 translate-x-1 group-hover:translate-x-0"
                    />
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 mb-5 leading-relaxed">
                    {project.description}
                </p>

                <div className="flex items-center gap-5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-slate-500" />
                        <span>{project.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CheckSquare size={13} className="text-slate-500" />
                        <span>{project.taskCount} tasks</span>
                    </div>
                </div>

                {/* Owner */}
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-[9px] font-medium text-white">
                        {project.ownerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs text-slate-500">{project.ownerName}</span>
                </div>
            </Link>
        </motion.div>
    );
}

export default function ProjectsListPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: projects, isLoading } = useQuery({
        queryKey: queryKeys.projects,
        queryFn: fetchProjects,
    });

    // Filter projects
    const filtered = (projects || []).filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="skeleton h-10 w-48 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-56 rounded-2xl" />)}
                </div>
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
            {/* Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">Projects</h1>
                    <p className="text-slate-400 mt-1">Manage your organization's projects</p>
                </div>
                <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-glow-sm hover:shadow-glow-md"
                    >
                        <Plus size={16} />
                        New Project
                    </button>
                </RoleGuard>
            </motion.div>

            {/* Search & Filter Bar */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-secondary border border-white/[0.08] text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 transition-colors"
                    />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-surface-secondary border border-white/[0.08] text-sm text-slate-300 cursor-pointer hover:bg-surface-tertiary transition-colors"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                </div>
            </motion.div>

            {/* Project Cards Grid */}
            {filtered.length === 0 ? (
                <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
                        <FolderKanban size={28} className="text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
                    <p className="text-slate-400 text-sm max-w-md">
                        {searchQuery || statusFilter !== 'ALL'
                            ? 'Try adjusting your search or filter to find what you\'re looking for.'
                            : 'Create your first project to get started.'}
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </motion.div>
            )}

            {/* Create Project Modal */}
            <CreateProjectModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </motion.div>
    );
}
