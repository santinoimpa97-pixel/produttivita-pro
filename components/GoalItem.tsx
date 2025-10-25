import React from 'react';
import { Goal, Task } from '../types.js';
import { PencilIcon } from './icons/PencilIcon.js';
import { TrashIcon } from './icons/TrashIcon.js';
import { ChecklistIcon } from './icons/ChecklistIcon.js';

interface GoalItemProps {
    goal: Goal;
    tasks: Task[];
    onEdit: (goal: Goal) => void;
    onDelete: (id: string) => void;
    onLinkTasks: (goal: Goal) => void;
    onToggleGoal: (id: string) => void;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, tasks, onEdit, onDelete, onLinkTasks, onToggleGoal }) => {
    const linkedTasks = tasks.filter(t => goal.linkedTaskIds.includes(t.id));
    const completedTasksCount = linkedTasks.filter(t => t.completed).length;
    const progress = linkedTasks.length > 0 ? (completedTasksCount / linkedTasks.length) * 100 : (goal.completed ? 100 : 0);

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-md space-y-3">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" checked={goal.completed} onChange={() => onToggleGoal(goal.id)} className="h-6 w-6 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer" />
                        <div>
                            <h3 className={`text-lg font-bold ${goal.completed ? 'line-through text-slate-400' : ''}`}>{goal.title}</h3>
                            {goal.targetDate && <p className="text-xs text-slate-500">Scadenza: {new Date(goal.targetDate).toLocaleDateString('it-IT')}</p>}
                        </div>
                    </div>
                    {goal.description && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 pl-9">{goal.description}</p>}
                </div>
                 <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => onLinkTasks(goal)} title="Collega Attività" className="p-2 text-slate-500 hover:text-violet-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ChecklistIcon className="w-5 h-5"/></button>
                    <button onClick={() => onEdit(goal)} className="p-2 text-slate-500 hover:text-violet-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><PencilIcon /></button>
                    <button onClick={() => onDelete(goal.id)} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><TrashIcon /></button>
                </div>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-violet-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                 <div className="text-xs text-slate-500 mt-1">{completedTasksCount} di {linkedTasks.length} attività completate</div>
            </div>
        </div>
    );
};
export default GoalItem;