import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, CheckSquare, Search, Menu, X, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from './lib/utils';
import { useUIStore } from './stores/uiStore';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import ProtectedRoute from './components/ProtectedRoute';
import CommandPalette from './components/CommandPalette';
import TaskDetailDrawer from './components/TaskDetailDrawer';

function Sidebar({ isOpen, setIsOpen }) {
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);

  const navLinks = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Kanban Board', to: '/projects/1/board', icon: KanbanSquare },
    { name: 'My Tasks', to: '/my-tasks', icon: CheckSquare },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-[100dvh] w-64 flex flex-col border-r border-white/[0.08] bg-surface-primary/95 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 py-6",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-glow-sm">
              F
            </div>
            <span className="text-xl font-display font-bold tracking-tight bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              FlowDesk
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 mb-6">
          <button
            onClick={toggleCommandPalette}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-slate-400 hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search size={16} />
              <span>Quick Search</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] uppercase font-medium text-slate-500 bg-white/5 px-2 py-1 rounded-md">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                isActive ? "text-indigo-300 bg-indigo-500/10" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={18}
                    className={cn(
                      "transition-colors duration-300",
                      isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  <span>{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </motion.aside>
    </>
  );
}

function Topbar({ setSidebarOpen }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-white/[0.08] bg-surface-primary/80 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white">
          <Menu size={24} />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border border-surface-primary"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-medium text-white shadow-glow-sm cursor-pointer border border-white/[0.08]">
          MP
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex min-h-[100dvh] bg-surface-canvas selection:bg-indigo-500/30">
        <CommandPalette />
        <TaskDetailDrawer />
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-x-hidden p-6 md:p-8">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/projects/:id/board" element={
                  <ProtectedRoute>
                    <KanbanBoard />
                  </ProtectedRoute>
                } />
                {/* Fallback for components not built yet */}
                <Route path="*" element={<div className="text-slate-400">Coming Soon</div>} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

