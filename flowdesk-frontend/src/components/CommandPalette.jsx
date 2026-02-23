import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, LayoutGrid, Settings, LogOut, CheckSquare } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { scaleIn } from '../lib/animations';

export default function CommandPalette() {
    const navigate = useNavigate();
    const { isCommandPaletteOpen, toggleCommandPalette, openTask } = useUIStore();
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggleCommandPalette();
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [toggleCommandPalette]);

    const runCommand = (command) => {
        toggleCommandPalette();
        command();
    };

    return (
        <AnimatePresence>
            {isCommandPaletteOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCommandPalette}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-2xl bg-surface-secondary/90 backdrop-blur-2xl border border-white/15 shadow-glow-lg rounded-2xl overflow-hidden"
                    >
                        <Command
                            className="w-full h-full flex flex-col"
                            shouldFilter={false}
                        >
                            <div className="flex items-center px-4 border-b border-white/10">
                                <Search className="w-5 h-5 text-slate-400 mr-2" />
                                <Command.Input
                                    autoFocus
                                    placeholder="Search tasks, projects, or commands..."
                                    value={inputValue}
                                    onValueChange={setInputValue}
                                    className="flex-1 h-14 bg-transparent outline-none text-white placeholder-slate-500 font-medium"
                                />
                                <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] uppercase font-medium text-slate-500 bg-white/5 px-2 py-1 rounded-md">
                                    ESC
                                </kbd>
                            </div>

                            <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
                                <Command.Empty className="text-sm text-slate-400 py-6 text-center">
                                    No results found.
                                </Command.Empty>

                                <Command.Group heading={<span className="text-xs font-semibold text-slate-500 px-2 uppercase tracking-wider">Navigation</span>}>
                                    <Command.Item
                                        onSelect={() => runCommand(() => navigate('/'))}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 aria-selected:bg-indigo-500/20 aria-selected:text-white cursor-pointer transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <LayoutDashboard size={16} className="text-indigo-400" />
                                        </div>
                                        Dashboard
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => runCommand(() => navigate('/projects/1/board'))}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 aria-selected:bg-indigo-500/20 aria-selected:text-white cursor-pointer transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <LayoutGrid size={16} className="text-indigo-400" />
                                        </div>
                                        Active Board
                                    </Command.Item>
                                </Command.Group>

                                <Command.Group heading={<span className="text-xs font-semibold text-slate-500 px-2 mt-4 block uppercase tracking-wider">Quick Actions</span>}>
                                    <Command.Item
                                        onSelect={() => runCommand(() => openTask(null))}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <CheckSquare size={16} className="text-emerald-400" />
                                        </div>
                                        Create new task
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => { }}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <Settings size={16} className="text-slate-400" />
                                        </div>
                                        Settings
                                    </Command.Item>
                                </Command.Group>
                            </Command.List>
                        </Command>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
