import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, GripVertical } from 'lucide-react';

// ── Helper: get initials from a name ──
function getInitials(name) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// ── Helper: get relative due-date string ──
function getRelativeDueDate(dueDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`, isOverdue: true };
    if (diffDays === 0) return { text: 'Due today', isOverdue: false };
    if (diffDays === 1) return { text: 'Due tomorrow', isOverdue: false };
    return { text: `${diffDays} days left`, isOverdue: false };
}

// ── Priority badge config ──
const PRIORITY_CONFIG = {
    HIGH: { label: 'High', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
    MEDIUM: { label: 'Med', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    LOW: { label: 'Low', bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export default function TaskCard({ task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
    const dueInfo = task.dueDate ? getRelativeDueDate(task.dueDate) : null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        group relative rounded-xl border border-slate-700/60 bg-slate-800/80
        backdrop-blur-sm p-4 cursor-grab active:cursor-grabbing
        transition-all duration-200 ease-out
        hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5
        ${isDragging ? 'opacity-50 shadow-2xl shadow-indigo-500/20 scale-[1.02] z-50 rotate-1' : ''}
      `}
        >
            {/* ── Drag Handle ── */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-500 hover:text-slate-300 cursor-grab"
            >
                <GripVertical size={16} />
            </div>

            {/* ── Priority Badge ── */}
            <span
                className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
          border ${priorityCfg.bg} ${priorityCfg.text} ${priorityCfg.border}
          mb-3
        `}
            >
                {priorityCfg.label}
            </span>

            {/* ── Title (2-line truncation) ── */}
            <h4 className="text-sm font-medium text-slate-100 leading-snug line-clamp-2 mb-3 pr-6">
                {task.title}
            </h4>

            {/* ── Footer: Assignee + Due Date ── */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/40">
                {/* Assignee */}
                {task.assignee && (
                    <div className="relative group/avatar">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-slate-800">
                            {getInitials(task.assignee.name)}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-xs text-slate-200 rounded-md whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg border border-slate-700 z-10">
                            {task.assignee.name}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900" />
                        </div>
                    </div>
                )}

                {/* Due Date */}
                {dueInfo && (
                    <div className={`flex items-center gap-1 text-xs ${dueInfo.isOverdue ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
                        <Calendar size={12} />
                        <span>{dueInfo.text}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
