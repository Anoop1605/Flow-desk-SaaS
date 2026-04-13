import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, X, Loader2, Inbox, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { activityApi, queryKeys } from '../lib/api';
import * as Avatar from '@radix-ui/react-avatar';
import * as Tooltip from '@radix-ui/react-tooltip';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '../lib/utils';
import { pageVariants, fadeUp, staggerContainer } from '../lib/animations';

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
  TASK_UPDATED: {
    color: 'bg-sky-500',
    ring: 'ring-sky-500/20',
    label: 'Task Updated',
  },
  TASK_DELETED: {
    color: 'bg-rose-500',
    ring: 'ring-rose-500/20',
    label: 'Task Deleted',
  },
  MEMBER_INVITED: {
    color: 'bg-violet-500',
    ring: 'ring-violet-500/20',
    label: 'Member Invited',
  },
  MEMBER_REMOVED: {
    color: 'bg-rose-500',
    ring: 'ring-rose-500/20',
    label: 'Member Removed',
  },
  PROJECT_CREATED: {
    color: 'bg-brand-500',
    ring: 'ring-brand-500/20',
    label: 'Project Created',
  },
  PROJECT_UPDATED: {
    color: 'bg-indigo-500',
    ring: 'ring-indigo-500/20',
    label: 'Project Updated',
  },
  PROJECT_DELETED: {
    color: 'bg-rose-500',
    ring: 'ring-rose-500/20',
    label: 'Project Deleted',
  },
  PROJECT_ARCHIVED: {
    color: 'bg-amber-500',
    ring: 'ring-amber-500/20',
    label: 'Project Archived',
  },
};

const ACTION_ALIASES = {
  TASK_CREATED: ['TASK_CREATED', 'CREATED_TASK'],
  TASK_UPDATED: ['TASK_UPDATED', 'UPDATED_TASK_STATUS'],
  TASK_DELETED: ['TASK_DELETED', 'DELETED_TASK'],
  PROJECT_CREATED: ['PROJECT_CREATED', 'CREATED_PROJECT'],
  PROJECT_UPDATED: ['PROJECT_UPDATED', 'UPDATED_PROJECT'],
  PROJECT_DELETED: ['PROJECT_DELETED', 'DELETED_PROJECT'],
};

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

export default function ActivityLogPage() {
  const [visibleCount, setVisibleCount] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const normalizeActionType = useCallback((action) => {
    if (!action) return 'TASK_CREATED';

    const upper = action.toUpperCase();
    const mapping = {
      CREATED_TASK: 'TASK_CREATED',
      UPDATED_TASK_STATUS: 'TASK_UPDATED',
      DELETED_TASK: 'TASK_DELETED',
      CREATED_PROJECT: 'PROJECT_CREATED',
      UPDATED_PROJECT: 'PROJECT_UPDATED',
      DELETED_PROJECT: 'PROJECT_DELETED',
    };

    return mapping[upper] || upper;
  }, []);

  const activityParams = useMemo(() => {
    if (selectedTypes.length === 0) {
      return {};
    }

    const values = selectedTypes.flatMap((type) => ACTION_ALIASES[type] || [type]);
    return {
      actionType: [...new Set(values)].join(','),
    };
  }, [selectedTypes]);

  const {
    data: activities = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.activity(activityParams),
    queryFn: async () => {
      const res = await activityApi.getActivityFeed(activityParams);
      const rows = Array.isArray(res.data) ? res.data : [];

      return rows.map((entry) => {
        const rawTime = entry.createdAt || entry.timestamp;
        const timestamp = rawTime ? new Date(rawTime) : new Date();

        return {
          id: entry.id,
          actionType: normalizeActionType(entry.action || entry.actionType),
          fullDescription: entry.description || '',
          actor: {
            name: entry.userName || 'Unknown User',
            initials: (entry.userName
              ? entry.userName
                  .split(' ')
                  .filter(Boolean)
                  .map((chunk) => chunk[0])
                  .join('')
                  .toUpperCase()
              : '??'
            ).slice(0, 2),
          },
          target: entry.entityType ? `${entry.entityType} #${entry.entityId}` : '',
          timestamp: Number.isNaN(timestamp.getTime()) ? new Date() : timestamp,
        };
      });
    },
    keepPreviousData: true,
  });

  const filteredActivities = useMemo(() => {
    if (!searchTerm.trim()) {
      return activities;
    }

    const term = searchTerm.toLowerCase();
    return activities.filter((activity) => {
      return (
        activity.actor.name.toLowerCase().includes(term) ||
        activity.target.toLowerCase().includes(term) ||
        activity.fullDescription.toLowerCase().includes(term)
      );
    });
  }, [activities, searchTerm]);

  useEffect(() => {
    setVisibleCount(10);
  }, [searchTerm, selectedTypes]);

  const visibleActivities = filteredActivities.slice(0, visibleCount);
  const hasMore = visibleCount < filteredActivities.length;

  const toggleType = useCallback((type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((value) => value !== type) : [...prev, type]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedTypes([]);
  }, []);

  const loadMore = useCallback(() => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 8);
      setIsLoadingMore(false);
    }, 350);
  }, []);

  const activeFilterCount = selectedTypes.length + (searchTerm.trim() ? 1 : 0);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-50">Activity Log</h1>
          <p className="text-sm text-slate-400 mt-1">Track everything that happens in your workspace</p>
        </div>

        <button
          onClick={() => setShowFilters((prev) => !prev)}
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
        <div className="flex-1 min-w-0">
          <div className="bg-surface rounded-2xl border border-white/5 p-6 shadow-card relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

            {isLoading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
              </div>
            )}

            {isError && !isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-rose-400 text-sm">Failed to load activity log. Please try again.</div>
              </div>
            )}

            {!isLoading && !isError && filteredActivities.length === 0 && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4">
                  <Inbox size={32} className="text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300 mb-1">No activity yet</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Actions your team takes will appear here. Try creating a task or inviting a team member.
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
            )}

            {!isLoading && !isError && filteredActivities.length > 0 && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <AnimatePresence mode="popLayout">
                  {visibleActivities.map((activity, index) => {
                    const config = ACTION_CONFIG[activity.actionType] || ACTION_CONFIG.TASK_CREATED;
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
                        <div className="flex flex-col items-center pt-1">
                          <div
                            className={cn(
                              'w-3 h-3 rounded-full ring-4 shrink-0',
                              config.color,
                              config.ring
                            )}
                          />
                          {!isLast && <div className="w-px flex-1 bg-white/5 min-h-[40px]" />}
                        </div>

                        <div className="flex-1 min-w-0 pb-6">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar.Root className="shrink-0">
                                <Avatar.Fallback
                                  delayMs={0}
                                  className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500/60 to-violet-600/60 flex items-center justify-center text-white text-[10px] font-bold"
                                >
                                  {activity.actor.initials}
                                </Avatar.Fallback>
                              </Avatar.Root>

                              <p className="text-sm text-slate-300 truncate">
                                <span className="font-semibold text-slate-100">{activity.actor.name}</span>{' '}
                                {activity.fullDescription || config.label.toLowerCase()}
                              </p>
                            </div>

                            <Tooltip.Provider delayDuration={200}>
                              <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                  <span className="text-xs text-slate-500 whitespace-nowrap shrink-0 cursor-default">
                                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                  </span>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                  <Tooltip.Content
                                    side="left"
                                    sideOffset={6}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-300 shadow-lg"
                                  >
                                    {format(activity.timestamp, 'MMM d, yyyy · h:mm a')}
                                    <Tooltip.Arrow className="fill-slate-800" />
                                  </Tooltip.Content>
                                </Tooltip.Portal>
                              </Tooltip.Root>
                            </Tooltip.Provider>
                          </div>

                          <p className="text-xs text-slate-500 mt-1 truncate">{activity.target}</p>

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

                {hasMore && (
                  <motion.div variants={fadeUp} className="flex justify-center pt-2">
                    <button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-slate-200 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoadingMore ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                      {isLoadingMore ? 'Loading...' : 'Load more activity'}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        <div
          className={cn(
            'lg:block lg:w-60 lg:shrink-0',
            showFilters
              ? 'fixed inset-0 z-50 bg-black/60 lg:static lg:bg-transparent'
              : 'hidden'
          )}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowFilters(false);
            }
          }}
        >
          <div
            className={cn(
              'bg-surface rounded-2xl border border-white/5 p-5 shadow-card lg:sticky lg:top-6',
              showFilters &&
                'absolute right-0 top-0 h-full w-72 rounded-l-2xl rounded-r-none lg:static lg:w-auto lg:h-auto lg:rounded-2xl'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-brand-400" />
                <h3 className="text-sm font-semibold text-slate-100">Filters</h3>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden text-slate-400 hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

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
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full bg-surface-raised border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-colors"
                />
              </div>
            </div>

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
                    <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', config.color)} />
                    <span className="truncate">{config.label}</span>
                    {selectedTypes.includes(key) && (
                      <span className="ml-auto text-brand-400 text-xs">OK</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

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
