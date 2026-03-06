
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Task } from '../types';
import TaskList from './TaskList';
import type { TaskListProps } from './TaskList';

type TaskCategoryProps = Omit<TaskListProps, 'tasks'> & {
    title: string;
    tasks: Task[];
    defaultOpen?: boolean;
};

const TaskCategory: React.FC<TaskCategoryProps> = ({ title, tasks, defaultOpen = false, ...taskListProps }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    if (tasks.length === 0) {
        return null;
    }

    return (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-5 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{title}</h3>
                    <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
                <div className={`p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 transition-all duration-300 group-hover:text-brand-600 ${isOpen ? 'rotate-180 bg-brand-50 dark:bg-brand-900/20 text-brand-600' : ''}`}>
                    <ChevronDown size={18} />
                </div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="p-5 pt-0 border-t border-slate-50 dark:border-slate-800/50">
                            <div className="mt-4">
                                <TaskList tasks={tasks} {...taskListProps} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TaskCategory;
