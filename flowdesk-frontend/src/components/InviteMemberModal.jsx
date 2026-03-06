import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Shield, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { modalVariants } from '../lib/animations';

export default function InviteMemberModal({ open, onOpenChange }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('MEMBER');
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        // Phase 1: just show a success toast (no real API call)
        toast.success('Invitation sent!', {
            description: `An invite has been sent to ${email} as ${role.toLowerCase()}.`,
        });

        // Reset form
        setEmail('');
        setRole('MEMBER');
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <Dialog.Content asChild>
                            <motion.div
                                variants={modalVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="w-full max-w-md rounded-2xl bg-surface-primary border border-white/[0.1] shadow-2xl"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
                                    <div>
                                        <Dialog.Title className="text-lg font-semibold text-white">
                                            Invite Member
                                        </Dialog.Title>
                                        <Dialog.Description className="text-xs text-slate-400 mt-0.5">
                                            Send an invitation to join the organization
                                        </Dialog.Description>
                                    </div>
                                    <Dialog.Close className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
                                        <X size={18} />
                                    </Dialog.Close>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    {/* Email */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
                                            <Mail size={12} />
                                            Email Address <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="colleague@company.com"
                                            className={cn(
                                                "w-full px-4 py-2.5 rounded-xl bg-surface-secondary border text-sm text-white placeholder:text-slate-500 transition-colors",
                                                errors.email ? "border-rose-500/50 focus:border-rose-500" : "border-white/[0.08] focus:border-indigo-500/50"
                                            )}
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-rose-400 mt-1">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
                                            <Shield size={12} />
                                            Role
                                        </label>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="appearance-none w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-white/[0.08] text-sm text-slate-300 cursor-pointer hover:bg-surface-tertiary transition-colors"
                                        >
                                            <option value="MEMBER">Member — Can view & update assigned tasks</option>
                                            <option value="MANAGER">Manager — Can manage projects & assign tasks</option>
                                        </select>
                                    </div>

                                    {/* Info box */}
                                    <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-3.5">
                                        <p className="text-xs text-indigo-300/80 leading-relaxed">
                                            If the email is not yet registered, they'll receive an invite link.
                                            Their account will be created with <span className="font-medium text-indigo-300">PENDING</span> status until first login.
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <Dialog.Close className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                            Cancel
                                        </Dialog.Close>
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-glow-sm"
                                        >
                                            <Send size={14} />
                                            Send Invite
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
