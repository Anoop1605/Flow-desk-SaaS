import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette } from 'lucide-react';
import { toast } from 'sonner';
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

export default function CreateProjectModal({ open, onOpenChange }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [colorTag, setColorTag] = useState('#6366f1');
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Project name is required';
        if (name.trim().length > 255) newErrors.name = 'Name must be at most 255 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        // Phase 1: just show a success toast (no real API call)
        toast.success('Project created successfully!', {
            description: `"${name}" has been created.`,
        });

        // Reset form
        setName('');
        setDescription('');
        setStatus('ACTIVE');
        setColorTag('#6366f1');
        setErrors({});
        onOpenChange(false);
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
                                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                variants={modalVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl bg-surface-primary border border-white/[0.1] shadow-2xl"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
                                    <Dialog.Title className="text-lg font-semibold text-white">
                                        Create New Project
                                    </Dialog.Title>
                                    <Dialog.Close className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
                                        <X size={18} />
                                    </Dialog.Close>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                            Project Name <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Website Redesign"
                                            className={cn(
                                                "w-full px-4 py-2.5 rounded-xl bg-surface-secondary border text-sm text-white placeholder:text-slate-500 transition-colors",
                                                errors.name ? "border-rose-500/50 focus:border-rose-500" : "border-white/[0.08] focus:border-indigo-500/50"
                                            )}
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-rose-400 mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                            Description
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="What is this project about?"
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-white/[0.08] text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 transition-colors resize-none"
                                        />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                            Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="appearance-none w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-white/[0.08] text-sm text-slate-300 cursor-pointer hover:bg-surface-tertiary transition-colors"
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="ON_HOLD">On Hold</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="ARCHIVED">Archived</option>
                                        </select>
                                    </div>

                                    {/* Color Tag */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
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
                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <Dialog.Close className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                            Cancel
                                        </Dialog.Close>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-glow-sm"
                                        >
                                            Create Project
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
