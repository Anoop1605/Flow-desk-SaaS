// ActivityLogPage.jsx — FlowDesk Member 1
// MongoDB-powered audit trail visualization (Phase 1: mock data)
//
// WHERE it fits:
//   This is the "showpiece page" for Member 1.
//   Presentation Layer → reads from GET /api/activity (mock in Phase 1)
//   Phase 2: Real MongoDB cursor-based pagination via TanStack Query
//
// LAYOUT:
//   Left  — Scrollable activity feed (flex-1)
//   Right — Filter panel (240px sticky sidebar, desktop only)

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Search,
  X,
  Calendar,
  Loader2,
  Inbox,
  ChevronDown,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { activityApi, queryKeys } from '../lib/api';
import * as Avatar from '@radix-ui/react-avatar';
import * as Tooltip from '@radix-ui/react-tooltip';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '../lib/utils';
import { pageVariants, fadeUp, staggerContainer } from '../lib/animations';

// ─── Action Type Config ──────────────────────────────────────────────────────
// WHY a config map? Each action type gets a unique dot color and human-readable label.
// These map to the MongoDB document's `actionType` field.

const ACTION_CONFIG = {
  TASK_CREATED: {
    color: 'bg-indigo-500',
    ring: 'ring-indigo-500/20',
    label: 'Task Created',
  },
  TASK_DONE: {
    color: 'bg-emerald-500',
    ring: 'ring-emerald-500/20',
    label: 'Task Completed',
  },
  MEMBER_INVITED: {
    color: 'bg-violet-500',
    ring: 'ring-violet-500/20',
    label: 'Member Invited',
  },
  PROJECT_ARCHIVED: {
    color: 'bg-amber-500',
    ring: 'ring-amber-500/20',
    label: 'Project Archived',
  },
  MEMBER_REMOVED: {
    color: 'bg-rose-500',
    ring: 'ring-rose-500/20',
    label: 'Member Removed',
  },
  TASK_UPDATED: {
    color: 'bg-sky-500',
    ring: 'ring-sky-500/20',
    label: 'Task Updated',
  },
  PROJECT_CREATED: {
    color: 'bg-brand-500',
    ring: 'ring-brand-500/20',
    label: 'Project Created',
  },
};

// Phase 2: Removed mock data in favor of real API

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
// WHY skeleton? Better perceived performance than a spinner.
// Shows the shape of the content before it loads.

function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 animate-pulse py-4">
      <div className="flex flex-col items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-slate-700" />
        <div className="w-px h-10 bg-slate-700/50" />
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-700/50 rounded w-1/3" />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ActivityLogPage() {
  const [visibleCount, setVisibleCount] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: queryKeys.activity({}),
    queryFn: async () => {
      const res = await activityApi.getActivityFeed();
      // Map backend fields to the view model expected by the component
      return res.data.map(a => ({
        id: a.id,
        actionType: a.action, // e.g., "TASK_CREATED"
        description: "", // The mapping will move actual description to another field if needed, but let's see
        fullDescription: a.description,
        actor: {
          name: a.userName,
          initials: a.userName ? a.userName.split(' ').map(n => n[0]).join('').toUpperCase() : '??',
        },
        target: a.entityType ? `${a.entityType} #${a.entityId}` : "",
        timestamp: new Date(a.createdAt),
      }));
    }
  });

  // ── Filter Logic ───────────────────────────────────────────────────────
  const filteredActivities = useMemo(() => {
    let result = activities;

    // Filter by action type
    if (selectedTypes.length > 0) {
      result = result.filter((a) => selectedTypes.includes(a.actionType));
    }

    // Filter by actor name search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.actor.name.toLowerCase().includes(term) ||
          a.target.toLowerCase().includes(term)
      );
    }

    return result;
  }, [activities, selectedTypes, searchTerm]);

  const visibleActivities = filteredActivities.slice(0, visibleCount);
  const hasMore = visibleCount < filteredActivities.length;

  // ── Toggle action type filter ──────────────────────────────────────────
  const toggleType = useCallback((type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  // ── Clear all filters ─────────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedTypes([]);
  }, []);

  // ── Load More (cursor-based pagination mock) ──────────────────────────
  const loadMore = useCallback(() => {
    setIsLoading(true);
    // Phase 1: Simulate network delay
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setIsLoading(false);
    }, 600);
  }, []);

  const activeFilterCount =
    selectedTypes.length + (searchTerm.trim() ? 1 : 0);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-50">
            Activity Log
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track everything that happens in your workspace
          </p>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors',
            showFilters
              ? 'border-brand-500/50 text-brand-400 bg-brand-500/10'
              : 'border-white/10 text-slate-400 hover:text-slate-200'
          )}
        >
          <Filter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* ── Left: Activity Feed ──────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="bg-surface rounded-2xl border border-white/5 p-6 shadow-card relative overflow-hidden">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

            {filteredActivities.length === 0 ? (
              /* ── Empty State ──────────────────────────────── */
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4">
                  <Inbox size={32} className="text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300 mb-1">
                  No activity yet
                </h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Actions your team takes will appear here. Try creating a task
                  or inviting a team member.
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </motion.div>
            ) : (
              /* ── Timeline Feed ────────────────────────────── */
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence mode="popLayout">
                  {visibleActivities.map((activity, index) => {
                    const config =
                      ACTION_CONFIG[activity.actionType] ||
                      ACTION_CONFIG.TASK_CREATED;
                    const isLast = index === visibleActivities.length - 1;

                    return (
                      <motion.div
                        key={activity.id}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="flex items-start gap-4 group"
                      >
                        {/* Timeline: dot + connecting line */}
                        <div className="flex flex-col items-center pt-1">
                          <div
                            className={cn(
                              'w-3 h-3 rounded-full ring-4 shrink-0',
                              config.color,
                              config.ring
                            )}
                          />
                          {!isLast && (
                            <div className="w-px flex-1 bg-white/5 min-h-[40px]" />
                          )}
                        </div>

                        {/* Event content */}
                        <div className="flex-1 min-w-0 pb-6">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Actor avatar */}
                              <Avatar.Root className="shrink-0">
                                <Avatar.Fallback
                                  delayMs={0}
                                  className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500/60 to-violet-600/60 flex items-center justify-center text-white text-[10px] font-bold"
                                >
                                  {activity.actor.initials}
                                </Avatar.Fallback>
                              </Avatar.Root>

                              {/* Action text */}
                              <p className="text-sm text-slate-300 truncate">
                                <span className="font-semibold text-slate-100">
                                  {activity.actor.name}
                                </span>{' '}
                                {activity.fullDescription}
                              </p>
                            </div>

                            {/* Timestamp with tooltip */}
                            <Tooltip.Provider delayDuration={200}>
                              <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                  <span className="text-xs text-slate-500 whitespace-nowrap shrink-0 cursor-default">
                                    {formatDistanceToNow(activity.timestamp, {
                                      addSuffix: true,
                                    })}
                                  </span>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                  <Tooltip.Content
                                    side="left"
                                    sideOffset={6}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-300 shadow-lg"
                                  >
                                    {format(
                                      activity.timestamp,
                                      'MMM d, yyyy · h:mm a'
                                    )}
                                    <Tooltip.Arrow className="fill-slate-800" />
                                  </Tooltip.Content>
                                </Tooltip.Portal>
                              </Tooltip.Root>
                            </Tooltip.Provider>
                          </div>

                          {/* Action type badge */}
                          <span
                            className={cn(
                              'inline-block mt-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full',
                              config.color.replace('bg-', 'text-').replace('-500', '-400'),
                              config.color.replace('-500', '-500/10')
                            )}
                          >
                            {config.label}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Load More Button */}
                {hasMore && (
                  <motion.div
                    variants={fadeUp}
                    className="flex justify-center pt-2"
                  >
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-slate-200 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                      {isLoading ? 'Loading...' : 'Load more activity'}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Right: Filter Panel (desktop sticky, mobile overlay) ── */}
        <div
          className={cn(
            'lg:block lg:w-60 lg:shrink-0',
            showFilters
              ? 'fixed inset-0 z-50 bg-black/60 lg:static lg:bg-transparent'
              : 'hidden'
          )}
          onClick={(e) => {
            // Close mobile overlay when clicking backdrop
            if (e.target === e.currentTarget) setShowFilters(false);
          }}
        >
          <div
            className={cn(
              'bg-surface rounded-2xl border border-white/5 p-5 shadow-card lg:sticky lg:top-6',
              // Mobile: slide from right
              showFilters && 'absolute right-0 top-0 h-full w-72 rounded-l-2xl rounded-r-none lg:static lg:w-auto lg:h-auto lg:rounded-2xl'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-brand-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  Filters
                </h3>
              </div>
              {/* Mobile close */}
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden text-slate-400 hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Actor Search */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
                Search
              </label>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Actor or target..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-raised border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-colors"
                />
              </div>
            </div>

            {/* Action Type Multi-Select */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">
                Action Type
              </label>
              <div className="space-y-1.5">
                {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => toggleType(key)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                      selectedTypes.includes(key)
                        ? 'bg-white/5 text-slate-200'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-white/[0.02]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-2.5 h-2.5 rounded-full shrink-0',
                        config.color
                      )}
                    />
                    <span className="truncate">{config.label}</span>
                    {selectedTypes.includes(key) && (
                      <span className="ml-auto text-brand-400 text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors"
              >
                <X size={14} />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
