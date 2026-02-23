import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { MOCK_TEAM_MEMBERS } from '../data/mockData';

const INITIAL_FORM = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
    dueDate: '',
};

export default function CreateTaskModal({ isOpen, onClose, onSubmit, defaultStatus = 'TODO' }) {
    const [form, setForm] = useState({ ...INITIAL_FORM });
    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    if (!isOpen) return null;

    // ── Validation ──
    function validate() {
        const newErrors = {};
        if (!form.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (form.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }
        if (form.dueDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const due = new Date(form.dueDate);
            if (due < today) {
                newErrors.dueDate = 'Due date must be in the future';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;

        const selectedMember = MOCK_TEAM_MEMBERS.find((m) => m.id === Number(form.assigneeId));
        const newTask = {
            id: Date.now(),
            title: form.title.trim(),
            description: form.description.trim(),
            status: defaultStatus,
            priority: form.priority,
            projectId: 1,
            projectName: 'Website Redesign',
            assignee: selectedMember ? { id: selectedMember.id, name: selectedMember.name } : null,
            dueDate: form.dueDate || null,
            createdAt: new Date().toISOString(),
        };

        onSubmit(newTask);
        setForm({ ...INITIAL_FORM });
        setErrors({});
        onClose();
    }

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    }

    const filteredMembers = MOCK_TEAM_MEMBERS.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedMemberName = MOCK_TEAM_MEMBERS.find((m) => m.id === Number(form.assigneeId))?.name || '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-lg mx-4 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-100">Create New Task</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    {/* Title */}
                    <div>
                        <label htmlFor="task-title" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="task-title"
                            type="text"
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Enter task title..."
                            className={`
                w-full px-3.5 py-2.5 rounded-lg bg-slate-900/60 border text-sm text-slate-100
                placeholder:text-slate-500 outline-none transition-colors
                focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                ${errors.title ? 'border-red-500/70' : 'border-slate-600'}
              `}
                        />
                        {errors.title && (
                            <p className="flex items-center gap-1 mt-1.5 text-xs text-red-400">
                                <AlertCircle size={12} /> {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="task-desc" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Description
                        </label>
                        <textarea
                            id="task-desc"
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Describe the task..."
                            rows={3}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/60 border border-slate-600 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 resize-none"
                        />
                    </div>

                    {/* Priority + Due Date Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Priority */}
                        <div>
                            <label htmlFor="task-priority" className="block text-sm font-medium text-slate-300 mb-1.5">
                                Priority
                            </label>
                            <select
                                id="task-priority"
                                value={form.priority}
                                onChange={(e) => handleChange('priority', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/60 border border-slate-600 text-sm text-slate-100 outline-none transition-colors focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 appearance-none cursor-pointer"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label htmlFor="task-duedate" className="block text-sm font-medium text-slate-300 mb-1.5">
                                Due Date
                            </label>
                            <input
                                id="task-duedate"
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => handleChange('dueDate', e.target.value)}
                                className={`
                  w-full px-3.5 py-2.5 rounded-lg bg-slate-900/60 border text-sm text-slate-100
                  outline-none transition-colors focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                  ${errors.dueDate ? 'border-red-500/70' : 'border-slate-600'}
                `}
                            />
                            {errors.dueDate && (
                                <p className="flex items-center gap-1 mt-1.5 text-xs text-red-400">
                                    <AlertCircle size={12} /> {errors.dueDate}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Assignee — Searchable Dropdown */}
                    <div className="relative">
                        <label htmlFor="task-assignee" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Assignee
                        </label>
                        <input
                            id="task-assignee"
                            type="text"
                            value={showDropdown ? searchTerm : selectedMemberName}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowDropdown(true);
                                if (!e.target.value) handleChange('assigneeId', '');
                            }}
                            onFocus={() => {
                                setShowDropdown(true);
                                setSearchTerm('');
                            }}
                            placeholder="Search team member..."
                            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/60 border border-slate-600 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                            autoComplete="off"
                        />
                        {showDropdown && (
                            <ul className="absolute z-20 w-full mt-1 max-h-40 overflow-y-auto bg-slate-900 border border-slate-600 rounded-lg shadow-xl">
                                {filteredMembers.length === 0 ? (
                                    <li className="px-3.5 py-2.5 text-xs text-slate-500">No members found</li>
                                ) : (
                                    filteredMembers.map((m) => (
                                        <li
                                            key={m.id}
                                            onClick={() => {
                                                handleChange('assigneeId', String(m.id));
                                                setSearchTerm('');
                                                setShowDropdown(false);
                                            }}
                                            className="px-3.5 py-2.5 text-sm text-slate-200 hover:bg-indigo-500/20 cursor-pointer transition-colors flex items-center justify-between"
                                        >
                                            <span>{m.name}</span>
                                            <span className="text-xs text-slate-500">{m.role}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-700/50">
                        <span className="text-xs text-slate-500">Status:</span>
                        <span className="text-xs font-medium text-indigo-400">
                            {defaultStatus === 'TODO' ? 'To Do' : defaultStatus === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
