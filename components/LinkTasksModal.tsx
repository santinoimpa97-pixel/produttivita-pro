
import React from 'react';
import { Task } from '../types';

interface LinkTasksModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    linkedTaskIds: string[];
    onToggleLinkTask: (taskId: string) => void;
    goalTitle: string;
}

const LinkTasksModal: React.FC<LinkTasksModalProps> = ({ isOpen, onClose, tasks, linkedTaskIds, onToggleLinkTask, goalTitle }) => {
    if (!isOpen) return null;
    
    const availableTasks = tasks.filter(t => !t.completed);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-lg flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Collega Attività</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Seleziona le attività da collegare all'obiettivo: <span className="font-semibold">{goalTitle}</span></p>
                </div>
                <div className="p-6 space-y-3 overflow-y-auto">
                    {availableTasks.length > 0 ? (
                        availableTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                <input
                                    id={`task-${task.id}`}
                                    type="checkbox"
                                    checked={linkedTaskIds.includes(task.id)}
                                    onChange={() => onToggleLinkTask(task.id)}
                                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <label htmlFor={`task-${task.id}`} className="flex-grow cursor-pointer text-slate-700 dark:text-slate-300">
                                    {task.text}
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nessuna attività "da fare" disponibile da collegare.</p>
                    )}
                </div>
                <div className="bg-slate-100 dark:bg-slate-700/50 px-6 py-3 flex justify-end rounded-b-xl mt-auto">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
                        Chiudi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkTasksModal;
