import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, LayoutGrid } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import ProtectedRoute from './components/ProtectedRoute';

function Sidebar() {
  const linkBase =
    'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200';
  const linkActive = 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20';
  const linkInactive =
    'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border border-transparent';

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-slate-700/50 bg-slate-900/60 backdrop-blur-sm px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm">
          F
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          FlowDesk
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
        <NavLink
          to="/projects/1/board"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
        >
          <LayoutGrid size={18} />
          Kanban Board
        </NavLink>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto pt-6 px-2">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-4">
          <p className="text-xs font-medium text-indigo-300 mb-1">Phase 1</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Mock data mode — not wired to backend yet.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
