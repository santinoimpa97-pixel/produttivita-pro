
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, CheckCircle2, Circle, AlertCircle, Check } from 'lucide-react';
import { Task } from '../types';
import { useLanguage } from '../App';

interface LinkTasksModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    linkedTaskIds: string[];
    onToggleLinkTask: (taskId: string) => void;
    goalTitle: string;
}

const LinkTasksModal: React.FC<LinkTasksModalProps> = ({ isOpen, onClose, tasks, linkedTaskIds, onToggleLinkTask, goalTitle }) => {
    const { t } = useLanguage();
    const availableTasks = tasks.filter(t => !t.completed);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-brand-500/10 overflow-hidden border border-slate-100 dark:border-slate-800/50 flex flex-col max-h-[80vh]"
                    >
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-brand-500 bg-opacity-10 dark:bg-opacity-20 text-brand-600">
                                        <Link2 size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{t('goals_link_tasks')}</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('goals_link_subtitle')}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {t('goals_link_select')} <span className="text-brand-600 dark:text-brand-400 font-bold">{goalTitle}</span>
                            </p>
                        </div>

                        <div className="p-6 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                            {availableTasks.length > 0 ? (
                                availableTasks.map(task => {
                                    const isLinked = linkedTaskIds.includes(task.id);
                                    return (
                                        <motion.button
                                            key={task.id}
                                            whileHover={{ x: 4 }}
                                            onClick={() => onToggleLinkTask(task.id)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 text-left ${
                                                isLinked 
                                                    ? 'bg-brand-500 bg-opacity-5 border-brand-500/20 text-slate-900 dark:text-white' 
                                                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                                isLinked ? 'bg-brand-600 text-white' : 'border-2 border-slate-200 dark:border-slate-700'
                                            }`}>
                                                {isLinked && <Check size={14} strokeWidth={4} />}
                                            </div>
                                            <span className="flex-1 font-bold text-sm truncate">{task.text}</span>
                                        </motion.button>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                                    <AlertCircle size={40} strokeWidth={1.5} />
                                    <p className="text-sm font-medium italic text-center max-w-[200px]">{t('goals_link_empty')}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50">
                            <button 
                                onClick={onClose} 
                                className="w-full py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                            >
                                {t('goals_done')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LinkTasksModal;
