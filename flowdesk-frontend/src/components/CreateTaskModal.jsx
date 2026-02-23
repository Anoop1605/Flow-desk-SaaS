import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Check, ChevronDown, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '../lib/utils';
import { fadeUp, scaleIn } from '../lib/animations';

const taskSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(255),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
    assigneeId: z.number().optional(),
    dueDate: z.string().optional(),
});

export default function CreateTaskModal({ isOpen, onClose, onSubmit, defaultStatus = 'TODO' }) {
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'MEDIUM',
            status: defaultStatus,
        }
    });

    // Reset when modal opens with new status
    React.useEffect(() => {
        if (isOpen) {
            reset({ title: '', description: '', priority: 'MEDIUM', status: defaultStatus });
        }
    }, [isOpen, defaultStatus, reset]);

    const handleFormSubmit = async (data) => {
        // STUB: Simulate API POST delay
        await new Promise(r => setTimeout(r, 600));

        // STUB: Create mock response shape matching backend DTO
        const newTask = {
            id: Date.now(),
            ...data,
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
            createdAt: new Date().toISOString(),
            assignee: data.assigneeId ? { id: data.assigneeId, name: 'Team Member' } : null
        };

        onSubmit(newTask);
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AnimatePresence>
                {isOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                            />
                        </Dialog.Overlay>

                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <Dialog.Content asChild>
                                <motion.div
                                    variants={scaleIn}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="w-full max-w-lg bg-surface-secondary border border-white/[0.08] shadow-glow-lg rounded-3xl overflow-hidden focus:outline-none"
                                >
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
                                        <Dialog.Title className="text-lg font-display font-semibold text-white">
                                            Create New Task
                                        </Dialog.Title>
                                        <Dialog.Close asChild>
                                            <button className="text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full">
                                                <X size={18} />
                                            </button>
                                        </Dialog.Close>
                                    </div>

                                    <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6 bg-surface-primary">
                                        <div className="space-y-4">
                                            {/* Title */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Task Title <span className="text-rose-500">*</span></label>
                                                <input
                                                    {...register('title')}
                                                    autoFocus
                                                    placeholder="E.g., Design new landing page hero"
                                                    className={cn(
                                                        "w-full bg-surface-canvas border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner",
                                                        errors.title ? "border-rose-500/50" : "border-white/10"
                                                    )}
                                                />
                                                <AnimatePresence mode="popLayout">
                                                    {errors.title && (
                                                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-rose-400 text-xs mt-1.5 ml-1">
                                                            {errors.title.message}
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                                                <textarea
                                                    {...register('description')}
                                                    rows={3}
                                                    placeholder="Add more details about this task..."
                                                    className="w-full bg-surface-canvas border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner resize-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Priority */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
                                                    <Controller
                                                        name="priority"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select.Root value={field.value} onValueChange={field.onChange}>
                                                                <Select.Trigger className="w-full flex items-center justify-between bg-surface-canvas border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors group">
                                                                    <Select.Value />
                                                                    <Select.Icon>
                                                                        <ChevronDown size={16} className="text-slate-500 group-hover:text-slate-300" />
                                                                    </Select.Icon>
                                                                </Select.Trigger>
                                                                <Select.Portal>
                                                                    <Select.Content className="overflow-hidden bg-surface-secondary border border-white/[0.08] shadow-glow-md rounded-xl backdrop-blur-xl z-[60]">
                                                                        <Select.Viewport className="p-1">
                                                                            {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                                                                                <Select.Item key={p} value={p} className="flex items-center px-8 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/20 hover:text-white rounded-lg cursor-pointer outline-none select-none relative data-[highlighted]:bg-indigo-500/20 data-[highlighted]:text-white">
                                                                                    <Select.ItemText>{p}</Select.ItemText>
                                                                                    <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                                                                                        <Check size={14} className="text-indigo-400" />
                                                                                    </Select.ItemIndicator>
                                                                                </Select.Item>
                                                                            ))}
                                                                        </Select.Viewport>
                                                                    </Select.Content>
                                                                </Select.Portal>
                                                            </Select.Root>
                                                        )}
                                                    />
                                                </div>

                                                {/* Due Date (Native Date Picker for Phase 1 stub) */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                                                    <div className="relative">
                                                        <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                        <input
                                                            type="date"
                                                            {...register('dueDate')}
                                                            className="w-full bg-surface-canvas border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all custom-calendar-icon"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.04]">
                                            <Dialog.Close asChild>
                                                <button type="button" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                                                    Cancel
                                                </button>
                                            </Dialog.Close>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-glow-sm disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                                {isSubmitting ? 'Creating...' : 'Create Task'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </Dialog.Content>
                        </div>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}

// Usage in KanbanBoard:
// <CreateTaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddTask} defaultStatus="TODO" />
