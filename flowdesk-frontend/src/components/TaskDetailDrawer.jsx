import { Drawer } from 'vaul';
import { useUIStore } from '../stores/uiStore';
import { X, CalendarClock, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api, queryKeys } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function TaskDetailDrawer() {
    const { isDrawerOpen, closeDrawer, selectedTaskId } = useUIStore();

    // Stub query out for Phase 1 - assumes we fetch the task details
    // In Phase 2: const res = await api.get(`/api/tasks/${selectedTaskId}`);
    const { data: task, isLoading } = useQuery({
        queryKey: ['task', selectedTaskId],
        enabled: !!selectedTaskId,
        queryFn: async () => {
            await new Promise(r => setTimeout(r, 400));
            return {
                id: selectedTaskId,
                title: "Task Title Placeholder",
                description: "This is a detailed description of the task. In Phase 2 this will be fetched from the backend.",
                priority: "HIGH",
                status: "IN_PROGRESS",
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
                assignee: { name: 'Alice' }
            };
        }
    });

    return (
        <Drawer.Root open={isDrawerOpen} onOpenChange={(o) => (!o ? closeDrawer() : null)} direction="right">
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
                <Drawer.Content className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] bg-surface-secondary shadow-glow-xl border-l border-white/[0.08] flex flex-col focus:outline-none">
                    <div className="flex-1 overflow-y-auto w-full">
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-6 h-20 border-b border-white/[0.08] bg-surface-secondary/80 backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                                    TSK-{task?.id || '...'}
                                </span>
                            </div>
                            <button onClick={closeDrawer} className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="p-6 space-y-6">
                                <div className="skeleton h-8 w-3/4 rounded-lg" />
                                <div className="skeleton h-24 w-full rounded-xl" />
                                <div className="skeleton h-32 w-full rounded-xl" />
                            </div>
                        ) : (
                            <div className="p-6">
                                <h2 className="text-xl font-display font-semibold text-white mb-6">
                                    {task?.title}
                                </h2>

                                <div className="flex flex-wrap items-center gap-3 mb-8">
                                    <div className="px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-xs font-semibold text-indigo-400">
                                        {task?.status?.replace('_', ' ')}
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-surface-canvas text-xs font-semibold text-slate-300">
                                        Priority: <span className="text-white ml-1">{task?.priority}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-surface-canvas text-xs font-semibold text-slate-300">
                                        <CalendarClock size={12} className="opacity-70" />
                                        {task?.dueDate && formatDistanceToNow(new Date(task?.dueDate), { addSuffix: true })}
                                    </div>
                                </div>

                                <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                                    <p className="whitespace-pre-wrap leading-relaxed">{task?.description}</p>
                                </div>

                                <div className="mt-12">
                                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/[0.08] pb-3">
                                        <MessageSquare size={16} className="text-slate-400" />
                                        Comments
                                    </h3>
                                    <div className="text-center py-8">
                                        <p className="text-sm text-slate-500 font-medium">No comments yet.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="h-[72px] border-t border-white/[0.08] bg-surface-canvas p-4 flex items-center">
                        <div className="w-full bg-surface-secondary border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-500 cursor-not-allowed">
                            Add a comment...
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
