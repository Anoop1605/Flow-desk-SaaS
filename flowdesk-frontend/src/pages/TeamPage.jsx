import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    Search, UserPlus, Users, Shield, Mail, MoreHorizontal, Crown
} from 'lucide-react';
import { queryKeys } from '../lib/api';
import { fadeUp, staggerContainer } from '../lib/animations';
import { cn } from '../lib/utils';
import { MOCK_PROJECT_MEMBERS } from '../data/mockData';
import InviteMemberModal from '../components/InviteMemberModal';
import RoleGuard from '../components/RoleGuard';
import { formatDistanceToNow } from 'date-fns';

const roleConfig = {
    MANAGER: { label: 'Manager', className: 'bg-violet-500/15 text-violet-400 border-violet-500/30', icon: Crown },
    MEMBER: { label: 'Member', className: 'bg-slate-500/15 text-slate-300 border-slate-500/30', icon: Users },
};

// Phase 1: mock fetch for all org members
const fetchTeamMembers = async () => {
    await new Promise((r) => setTimeout(r, 500));
    // Simulate org-wide members (combine with distinct roles)
    return [
        ...MOCK_PROJECT_MEMBERS,
        { id: 6, userId: 6, userName: 'Fiona Carter', userEmail: 'fiona@flowdesk.io', roleInProject: 'MEMBER', joinedAt: '2026-02-10T09:00:00Z' },
        { id: 7, userId: 7, userName: 'George Kim', userEmail: 'george@flowdesk.io', roleInProject: 'MANAGER', joinedAt: '2026-01-25T10:30:00Z' },
    ];
};

// Pretty avatar colors per user
const avatarColors = [
    'from-indigo-500 to-violet-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-sky-500 to-cyan-500',
    'from-fuchsia-500 to-purple-500',
    'from-lime-500 to-green-500',
];

export default function TeamPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const { data: members, isLoading } = useQuery({
        queryKey: ['team-members'],
        queryFn: fetchTeamMembers,
    });

    const filtered = (members || []).filter((m) =>
        m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const managerCount = (members || []).filter(m => m.roleInProject === 'MANAGER').length;
    const memberCount = (members || []).filter(m => m.roleInProject === 'MEMBER').length;

    if (isLoading) {
        return (
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="skeleton h-10 w-48 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
                </div>
                <div className="skeleton h-96 rounded-2xl" />
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
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">Team</h1>
                    <p className="text-slate-400 mt-1">Manage your organization's members and roles</p>
                </div>
                <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
                    <button
                        onClick={() => setIsInviteOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-glow-sm hover:shadow-glow-md"
                    >
                        <UserPlus size={16} />
                        Invite Member
                    </button>
                </RoleGuard>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-primary/50 border border-white/[0.08]">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-display font-bold text-white">{members?.length || 0}</p>
                        <p className="text-xs text-slate-400">Total Members</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-primary/50 border border-white/[0.08]">
                    <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        <Crown size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-display font-bold text-white">{managerCount}</p>
                        <p className="text-xs text-slate-400">Managers</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-primary/50 border border-white/[0.08]">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Shield size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-display font-bold text-white">{memberCount}</p>
                        <p className="text-xs text-slate-400">Members</p>
                    </div>
                </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div variants={fadeUp}>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search members by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-secondary border border-white/[0.08] text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 transition-colors"
                    />
                </div>
            </motion.div>

            {/* Members Table */}
            <motion.div variants={fadeUp} className="rounded-2xl bg-surface-primary/40 border border-white/[0.08] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/[0.08] bg-white/[0.02] text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <div className="col-span-5">Member</div>
                    <div className="col-span-3">Role</div>
                    <div className="col-span-3 hidden sm:block">Joined</div>
                    <div className="col-span-1"></div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-white/[0.06]">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Users size={32} className="text-slate-500 mb-3" />
                            <p className="text-sm text-slate-400">No members found matching your search.</p>
                        </div>
                    ) : (
                        filtered.map((member, idx) => {
                            const role = roleConfig[member.roleInProject] || roleConfig.MEMBER;
                            return (
                                <div
                                    key={member.id}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors"
                                >
                                    {/* Member Info */}
                                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                                        <div className={cn(
                                            'w-9 h-9 rounded-full bg-gradient-to-tr flex items-center justify-center text-xs font-medium text-white flex-shrink-0',
                                            avatarColors[idx % avatarColors.length]
                                        )}>
                                            {member.userName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{member.userName}</p>
                                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                                <Mail size={10} />
                                                {member.userEmail}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div className="col-span-3">
                                        <RoleGuard allowedRoles={['ADMIN']}>
                                            <select
                                                defaultValue={member.roleInProject}
                                                className="appearance-none px-3 py-1.5 rounded-lg bg-surface-secondary border border-white/[0.08] text-xs text-slate-300 cursor-pointer hover:bg-surface-tertiary transition-colors"
                                            >
                                                <option value="MANAGER">Manager</option>
                                                <option value="MEMBER">Member</option>
                                            </select>
                                        </RoleGuard>
                                        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-medium rounded-full border', role.className)}>
                                            <role.icon size={10} />
                                            {role.label}
                                        </span>
                                    </div>

                                    {/* Joined */}
                                    <div className="col-span-3 hidden sm:block text-xs text-slate-500">
                                        {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-1 flex justify-end">
                                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white/5 hover:text-white transition-colors">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </motion.div>

            {/* Invite Member Modal */}
            <InviteMemberModal open={isInviteOpen} onOpenChange={setIsInviteOpen} />
        </motion.div>
    );
}
