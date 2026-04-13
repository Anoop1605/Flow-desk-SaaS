import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { modalVariants } from '../lib/animations';

const COLOR_OPTIONS = [
    { value: '#6366f1', label: 'Indigo' },
    { value: '#8b5cf6', label: 'Violet' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#f59e0b', label: 'Amber' },
    { value: '#10b981', label: 'Emerald' },
    { value: '#06b6d4', label: 'Cyan' },
    { value: '#f43f5e', label: 'Rose' },
    { value: '#84cc16', label: 'Lime' },
];

export default function CreateProjectModal({ open, onOpenChange, onSubmit }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [colorTag, setColorTag] = useState('#6366f1');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Project name is required';
        if (name.trim().length > 255) newErrors.name = 'Name must be at most 255 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ name, description, status, colorTag });
            // Reset form
            setName('');
            setDescription('');
            setStatus('ACTIVE');
            setColorTag('#6366f1');
            setErrors({});
            onOpenChange(false);
        } catch (err) {
            console.error('Failed to create project:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (isOpen) => {
        if (!isOpen) {
            setErrors({});
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <AnimatePresence>
                {open && (
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
                                    variants={modalVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="w-full max-w-lg bg-surface-secondary border border-white/[0.08] shadow-glow-lg rounded-3xl overflow-hidden focus:outline-none"
                                >
                                    <Dialog.Title className="hidden">Create New Project</Dialog.Title>
                                    <Dialog.Description className="hidden">Create a new project for your organization</Dialog.Description>
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
                                        <h2 className="text-lg font-display font-semibold text-white">
                                            Create New Project
                                        </h2>
                                        <Dialog.Close asChild>
                                            <button className="text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full">
                                                <X size={18} />
                                            </button>
                                        </Dialog.Close>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-surface-primary">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                                Project Name <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g. Website Redesign"
                                                className={cn(
                                                    "w-full bg-surface-canvas border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner",
                                                    errors.name ? "border-rose-500/50" : "border-white/10"
                                                )}
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-rose-400 mt-1.5 ml-1">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="What is this project about?"
                                                rows={3}
                                                className="w-full bg-surface-canvas border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner resize-none"
                                            />
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="appearance-none w-full px-4 py-2.5 rounded-xl bg-surface-canvas border border-white/10 text-sm text-slate-300 cursor-pointer hover:bg-white/5 transition-colors"
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="ON_HOLD">On Hold</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="ARCHIVED">Archived</option>
                                            </select>
                                        </div>

                                        {/* Color Tag */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                                <Palette size={12} />
                                                Color Tag
                                            </label>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {COLOR_OPTIONS.map((color) => (
                                                    <button
                                                        key={color.value}
                                                        type="button"
                                                        onClick={() => setColorTag(color.value)}
                                                        className={cn(
                                                            "w-8 h-8 rounded-full transition-all duration-200 border-2",
                                                            colorTag === color.value
                                                                ? "border-white scale-110 shadow-glow-sm"
                                                                : "border-transparent hover:scale-105"
                                                        )}
                                                        style={{ backgroundColor: color.value }}
                                                        title={color.label}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.04]">
                                            <Dialog.Close className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                                                Cancel
                                            </Dialog.Close>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-glow-sm disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                                {isSubmitting ? 'Creating...' : 'Create Project'}
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
