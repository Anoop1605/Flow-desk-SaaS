import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { toast } from 'sonner';
import {
    Search, UserPlus, Users, Shield, Mail, Crown, MoreHorizontal, UserMinus, ShieldAlert
} from 'lucide-react';
import { teamApi } from '../lib/api';
import { fadeUp, staggerContainer } from '../lib/animations';
import { cn } from '../lib/utils';
import InviteMemberModal from '../components/InviteMemberModal';
import RoleGuard from '../components/RoleGuard';
import { formatDistanceToNow } from 'date-fns';

const roleConfig = {
    ORGANIZATION_OWNER: { label: 'Owner', className: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', icon: Crown },
    ORGANIZATION_MEMBER: { label: 'Member', className: 'bg-slate-500/15 text-slate-300 border-slate-500/30', icon: Users },
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
    const queryClient = useQueryClient();

    const { data: members, isLoading } = useQuery({
        queryKey: ['team-members'],
        queryFn: async () => {
            const res = await teamApi.getMembers();
            return res.data;
        },
    });

    const inviteMutation = useMutation({
        mutationFn: (payload) => teamApi.invite(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
            queryClient.invalidateQueries({ queryKey: ['activity'] });
            queryClient.invalidateQueries({ queryKey: ['topbar-notifications'] });
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId) => teamApi.removeMember(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
            toast.success("Member removed successfully");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to remove member");
        }
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }) => teamApi.updateRole(userId, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
            toast.success("Role updated successfully");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update role");
        }
    });

    const filtered = (members || []).filter((m) =>
        m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const managerCount = (members || []).filter(m => m.roleInProject === 'ORGANIZATION_OWNER').length;
    const memberCount = (members || []).filter(m => m.roleInProject === 'ORGANIZATION_MEMBER').length;

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
                <RoleGuard allowedRoles={['ORGANIZATION_OWNER']}>
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
                            const role = roleConfig[member.roleInProject] || roleConfig.ORGANIZATION_MEMBER;
                            return (
                                <div
                                    key={member.id}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors"
                                >
                                    {/* Member Info */}
                                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                                        {member.userAvatar ? (
                                            <img
                                                src={member.userAvatar}
                                                alt={member.userName}
                                                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className={cn(
                                                'w-9 h-9 rounded-full bg-gradient-to-tr flex items-center justify-center text-xs font-medium text-white flex-shrink-0',
                                                avatarColors[idx % avatarColors.length]
                                            )}>
                                                {member.userName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        )}
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
                                        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-medium rounded-full border', role.className)}>
                                            <role.icon size={10} />
                                            {role.label}
                                        </span>
                                    </div>

                                    {/* Joined */}
                                    <div className="col-span-3 hidden sm:block text-xs text-slate-500">
                                        {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                                    </div>

                                    {/* Actions menu */}
                                    <div className="col-span-1 flex justify-end">
                                        <RoleGuard allowedRoles={['ORGANIZATION_OWNER']}>
                                            <DropdownMenu.Root>
                                                <DropdownMenu.Trigger asChild>
                                                    <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white/5 hover:text-white transition-colors outline-none cursor-pointer">
                                                        <MoreHorizontal size={14} />
                                                    </button>
                                                </DropdownMenu.Trigger>
                                                <DropdownMenu.Portal>
                                                    <DropdownMenu.Content
                                                        sideOffset={5}
                                                        align="end"
                                                        className="z-[100] min-w-[200px] p-2 bg-surface-secondary border border-white/[0.08] rounded-xl shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
                                                    >
                                                        {member.roleInProject !== 'ORGANIZATION_OWNER' ? (
                                                            <DropdownMenu.Item
                                                                onSelect={() => updateRoleMutation.mutate({ userId: member.userId, role: 'ORGANIZATION_OWNER' })}
                                                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm md:text-sm text-slate-300 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer outline-none transition-colors"
                                                            >
                                                                <ShieldAlert size={14} />
                                                                Promote to Owner
                                                            </DropdownMenu.Item>
                                                        ) : (
                                                            <DropdownMenu.Item
                                                                onSelect={() => updateRoleMutation.mutate({ userId: member.userId, role: 'ORGANIZATION_MEMBER' })}
                                                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm md:text-sm text-slate-300 rounded-lg hover:bg-slate-500/10 hover:text-slate-400 cursor-pointer outline-none transition-colors"
                                                            >
                                                                <Users size={14} />
                                                                Demote to Member
                                                            </DropdownMenu.Item>
                                                        )}

                                                        <DropdownMenu.Separator className="h-px bg-white/[0.08] my-2" />
                                                        
                                                        <DropdownMenu.Item
                                                            onSelect={() => removeMemberMutation.mutate(member.userId)}
                                                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm md:text-sm text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer outline-none transition-colors"
                                                        >
                                                            <UserMinus size={14} />
                                                            Remove User
                                                        </DropdownMenu.Item>
                                                    </DropdownMenu.Content>
                                                </DropdownMenu.Portal>
                                            </DropdownMenu.Root>
                                        </RoleGuard>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </motion.div>

            {/* Invite Member Modal */}
            <InviteMemberModal
                open={isInviteOpen}
                onOpenChange={setIsInviteOpen}
                onSubmit={(payload) => inviteMutation.mutateAsync(payload)}
            />
        </motion.div>
    );
}
