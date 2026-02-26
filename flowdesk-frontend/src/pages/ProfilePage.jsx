// ProfilePage.jsx — FlowDesk Member 1
// User profile page with 4 sections:
//   1. Avatar section — Radix Avatar with initials fallback + gradient
//   2. Personal info form — First name, Last name, Email (read-only)
//   3. Password change — Current, New, Confirm password (separate form)
//   4. Tenant info card — Org name, role badge, member-since date
//
// WHERE it fits in the architecture:
//   Presentation Layer → reads user from AuthContext
//   Phase 1: Mock data, forms work locally but don't hit backend
//   Phase 2: Save fires PUT /api/auth/me and PUT /api/auth/me/password

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  User,
  Lock,
  Mail,
  Building2,
  Shield,
  Calendar,
  Camera,
  Loader2,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import * as Tooltip from '@radix-ui/react-tooltip';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { pageVariants, staggerContainer, cardVariant } from '../lib/animations';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────
// WHY separate schemas? Personal info and password change are independent forms.
// Submitting one doesn't require the other to be valid.

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Role Badge Styling ──────────────────────────────────────────────────────
// WHY a map? Each role gets its own color treatment.
// This maps directly to the 4 RBAC roles in FlowDesk.

const ROLE_STYLES = {
  SUPER_ADMIN: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    label: 'Super Admin',
  },
  ADMIN: {
    bg: 'bg-violet-500/15',
    text: 'text-violet-400',
    border: 'border-violet-500/30',
    label: 'Admin',
  },
  MANAGER: {
    bg: 'bg-brand-500/15',
    text: 'text-brand-400',
    border: 'border-brand-500/30',
    label: 'Manager',
  },
  MEMBER: {
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    label: 'Member',
  },
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Split user name into first/last for the form defaults
  const nameParts = (user?.name || 'Demo User').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // ── Personal Info Form ─────────────────────────────────────────────────
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName,
      lastName,
    },
  });

  // ── Password Form ─────────────────────────────────────────────────────
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // ── Submit Handlers ─────────────────────────────────────────────────────

  const handleProfileSave = useCallback(
    async (data) => {
      try {
        // Phase 1: Simulate API call
        // Phase 2: Replace with → await api.put('/api/auth/me', data);
        await new Promise((r) => setTimeout(r, 800));
        toast.success('Profile updated');
      } catch {
        toast.error('Failed to update profile');
      }
    },
    []
  );

  const handlePasswordChange = useCallback(
    async (data) => {
      try {
        // Phase 1: Simulate API call
        // Phase 2: Replace with → await api.put('/api/auth/me/password', data);
        await new Promise((r) => setTimeout(r, 800));
        toast.success('Password changed successfully');
        passwordForm.reset();
      } catch {
        toast.error('Failed to change password');
      }
    },
    [passwordForm]
  );

  // ── Derived values ────────────────────────────────────────────────────
  const initials =
    (firstName.charAt(0) + (lastName.charAt(0) || '')).toUpperCase() || 'DU';
  const roleStyle = ROLE_STYLES[user?.role] || ROLE_STYLES.MEMBER;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-2xl mx-auto"
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-slate-50">
          Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account settings
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ── Section 1: Avatar ─────────────────────────────────────── */}
        <motion.div
          variants={cardVariant}
          className="bg-surface rounded-2xl border border-white/5 p-6 shadow-card relative overflow-hidden"
        >
          {/* Top gradient line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

          <div className="flex items-center gap-5">
            {/* Radix Avatar */}
            <Avatar.Root className="relative shrink-0">
              <Avatar.Image
                className="w-16 h-16 rounded-full object-cover"
                src={undefined} // No avatar URL in Phase 1
                alt={user?.name || 'User'}
              />
              <Avatar.Fallback
                delayMs={0}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-glow-sm"
              >
                {initials}
              </Avatar.Fallback>
            </Avatar.Root>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-100 truncate">
                {user?.name || 'Demo User'}
              </h2>
              <p className="text-sm text-slate-400 truncate">
                {user?.email || 'demo@flowdesk.io'}
              </p>
            </div>

            {/* Change Photo — disabled in Phase 1 */}
            <Tooltip.Provider delayDuration={300}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-400 opacity-50 cursor-not-allowed"
                  >
                    <Camera size={16} />
                    Change Photo
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="top"
                    sideOffset={6}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-300 shadow-lg"
                  >
                    Available in Phase 3
                    <Tooltip.Arrow className="fill-slate-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </motion.div>

        {/* ── Section 2: Personal Info ──────────────────────────────── */}
        <motion.div
          variants={cardVariant}
          className="bg-surface rounded-2xl border border-white/5 p-6 shadow-card"
        >
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-brand-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Personal Information
            </h3>
          </div>

          <form
            onSubmit={profileForm.handleSubmit(handleProfileSave)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">
                  First Name
                </label>
                <input
                  type="text"
                  {...profileForm.register('firstName')}
                  className={cn(
                    'w-full bg-surface-raised border rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
                    profileForm.formState.errors.firstName
                      ? 'border-rose-500/50 focus:ring-rose-500/20'
                      : 'border-white/10 focus:border-brand-500 focus:ring-brand-500/20'
                  )}
                />
                {profileForm.formState.errors.firstName && (
                  <p className="text-sm text-rose-400" role="alert">
                    {profileForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Last Name
                </label>
                <input
                  type="text"
                  {...profileForm.register('lastName')}
                  className={cn(
                    'w-full bg-surface-raised border rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
                    profileForm.formState.errors.lastName
                      ? 'border-rose-500/50 focus:ring-rose-500/20'
                      : 'border-white/10 focus:border-brand-500 focus:ring-brand-500/20'
                  )}
                />
                {profileForm.formState.errors.lastName && (
                  <p className="text-sm text-rose-400" role="alert">
                    {profileForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email — Read-Only */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || 'demo@flowdesk.io'}
                  disabled
                  className="w-full bg-surface-raised/50 border border-white/5 rounded-lg pl-4 pr-10 py-2.5 text-slate-400 cursor-not-allowed"
                />
                <Lock
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
                />
              </div>
              <p className="text-xs text-slate-500">
                Email cannot be changed. Contact your admin.
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileForm.formState.isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-400 focus:ring-2 focus:ring-brand-500/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {profileForm.formState.isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>

        <Separator.Root className="h-px bg-white/5" />

        {/* ── Section 3: Password Change ────────────────────────────── */}
        <motion.div
          variants={cardVariant}
          className="bg-surface rounded-2xl border border-white/5 p-6 shadow-card"
        >
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} className="text-amber-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Change Password
            </h3>
          </div>

          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
            className="space-y-4"
          >
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  {...passwordForm.register('currentPassword')}
                  className={cn(
                    'w-full bg-surface-raised border rounded-lg pl-4 pr-10 py-2.5 text-white placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
                    passwordForm.formState.errors.currentPassword
                      ? 'border-rose-500/50 focus:ring-rose-500/20'
                      : 'border-white/10 focus:border-brand-500 focus:ring-brand-500/20'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-hidden="true"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-rose-400" role="alert">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, 1 upper, 1 number"
                    autoComplete="new-password"
                    {...passwordForm.register('newPassword')}
                    className={cn(
                      'w-full bg-surface-raised border rounded-lg pl-4 pr-10 py-2.5 text-white placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
                      passwordForm.formState.errors.newPassword
                        ? 'border-rose-500/50 focus:ring-rose-500/20'
                        : 'border-white/10 focus:border-brand-500 focus:ring-brand-500/20'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-hidden="true"
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-rose-400" role="alert">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    {...passwordForm.register('confirmPassword')}
                    className={cn(
                      'w-full bg-surface-raised border rounded-lg pl-4 pr-10 py-2.5 text-white placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
                      passwordForm.formState.errors.confirmPassword
                        ? 'border-rose-500/50 focus:ring-rose-500/20'
                        : 'border-white/10 focus:border-brand-500 focus:ring-brand-500/20'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-hidden="true"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-rose-400" role="alert">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium hover:bg-amber-500/25 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {passwordForm.formState.isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Shield size={16} />
                )}
                Update Password
              </button>
            </div>
          </form>
        </motion.div>

        <Separator.Root className="h-px bg-white/5" />

        {/* ── Section 4: Tenant Info (Read-Only) ────────────────────── */}
        <motion.div
          variants={cardVariant}
          className="bg-surface rounded-2xl border border-white/5 p-6 shadow-card"
        >
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={18} className="text-violet-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Workspace Info
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Organization */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Organization
              </span>
              <p className="text-sm font-medium text-slate-200">
                {user?.tenantId
                  ? user.tenantId
                      .replace('org_', '')
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  : 'Demo Workspace'}
              </p>
            </div>

            {/* Role */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Your Role
              </span>
              <div>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border',
                    roleStyle.bg,
                    roleStyle.text,
                    roleStyle.border
                  )}
                >
                  {roleStyle.label}
                </span>
              </div>
            </div>

            {/* Member Since */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Member Since
              </span>
              <div className="flex items-center gap-1.5 text-sm text-slate-200">
                <Calendar size={14} className="text-slate-400" />
                {/* Phase 1: Hardcoded date. Phase 2: user.createdAt from API */}
                <span>February 2026</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Usage Example:
// <Route path="/profile" element={<ProfilePage />} />
