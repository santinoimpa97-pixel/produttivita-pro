import React, { useState } from 'react';
import { Task } from '../types';
import TaskList from './TaskList';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import type { TaskListProps } from './TaskList';

type TaskCategoryProps = Omit<TaskListProps, 'tasks'> & {
    title: string;
    tasks: Task[];
    defaultOpen?: boolean;
};

const TaskCategory: React.FC<TaskCategoryProps> = ({ title, tasks, defaultOpen = false, ...taskListProps }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    if (tasks.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <span className="bg-slate-200 dark:bg-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full">{tasks.length}</span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <TaskList tasks={tasks} {...taskListProps} />
                </div>
            )}
        </div>
    );
};
export default TaskCategory;
