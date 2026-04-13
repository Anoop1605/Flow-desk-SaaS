import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { CalendarClock, GripVertical, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDistanceToNow, isPast } from 'date-fns';
import { useUIStore } from '../stores/uiStore';

function TaskCardComponent({ task, overlay = false }) {
    const openTask = useUIStore(s => s.openTask);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: String(task.id),
        disabled: overlay,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isHigh = task.priority === 'HIGH';
    const isMedium = task.priority === 'MEDIUM';
    const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative bg-surface-primary/60 hover:bg-surface-primary backdrop-blur-md rounded-xl border border-white/[0.06] p-4 transition-colors",
                overlay ? "cursor-default" : "cursor-grab active:cursor-grabbing",
                isDragging ? "opacity-30" : "opacity-100",
                overlay ? "shadow-glow-md rotate-2 scale-105 border-indigo-500/30 bg-surface-primary" : "shadow-sm"
            )}
            {...attributes}
            {...listeners}
        >
            {!overlay && (
                <div className="absolute inset-0 z-0" onClick={() => !isDragging && openTask(task.id)} />
            )}
            <div className="relative z-10 flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                            "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border",
                            isHigh ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                isMedium ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        )}>
                            {task.priority}
                        </span>
                        {isOverdue && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                                <AlertCircle size={10} /> Overdue
                            </span>
                        )}
                    </div>
                    <h4 className="text-sm font-medium text-slate-200 leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
                        {task.title}
                    </h4>
                </div>
                <button className="text-slate-600 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 p-1">
                    <GripVertical size={16} />
                </button>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarClock size={14} className={isOverdue ? "text-rose-400" : ""} />
                    <span className={isOverdue ? "text-rose-400 font-medium" : ""}>
                        {task.dueDate ? formatDistanceToNow(new Date(task.dueDate), { addSuffix: true }) : 'No due date'}
                    </span>
                </div>

                {task.assignee && (
                    task.assignee.avatar ? (
                        <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            title={task.assignee.name}
                            className="w-6 h-6 rounded-full object-cover shadow-sm ring-2 ring-surface-primary"
                        />
                    ) : (
                        <div
                            className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-surface-primary"
                            title={task.assignee.name}
                        >
                            {task.assignee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

// React.memo prevents unnecessary re-renders during drag
export const TaskCard = memo(TaskCardComponent);
