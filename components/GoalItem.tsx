import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Link2, Calendar, CheckCircle2, Circle, Target } from 'lucide-react';
import { Goal, Task } from '../types';
import { useLanguage } from '../App';

interface GoalItemProps {
    goal: Goal;
    tasks: Task[];
    onEdit: (goal: Goal) => void;
    onDelete: (id: string) => void;
    onLinkTasks: (goal: Goal) => void;
    onToggleGoal: (id: string) => void;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, tasks, onEdit, onDelete, onLinkTasks, onToggleGoal }) => {
    const { t, language } = useLanguage();
    const locale = language === 'en' ? 'en-US' : 'it-IT';
    const linkedTasks = tasks.filter(t => goal.linkedTaskIds.includes(t.id));
    const completedTasks = linkedTasks.filter(t => t.completed).length;
    const progress = linkedTasks.length > 0 ? (completedTasks / linkedTasks.length) * 100 : (goal.completed ? 100 : 0);

    return (
        <div className="glass-card p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 hover:shadow-xl hover:shadow-brand-500/5 transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-grow space-y-4">
                    <div className="flex items-start gap-4">
                        <button 
                            onClick={() => onToggleGoal(goal.id)}
                            className={`mt-1 transition-all duration-300 ${goal.completed ? 'text-emerald-500 scale-110' : 'text-slate-300 hover:text-brand-500 hover:scale-110'}`}
                        >
                            {goal.completed ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <Circle size={24} strokeWidth={2.5} />}
                        </button>
                        <div className="space-y-1">
                            <h3 className={`text-lg font-black tracking-tight transition-all ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                                {goal.title}
                            </h3>
                            {goal.targetDate && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <Calendar size={12} />
                                    {t('tasks_due_date')}: {new Date(goal.targetDate).toLocaleDateString(locale)}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {goal.description && (
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 pl-10 leading-relaxed">
                            {goal.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <button 
                        onClick={() => onLinkTasks(goal)} 
                        title={t('goals_link_tasks')} 
                        className="p-2.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all"
                    >
                        <Link2 size={18}/>
                    </button>
                    <button 
                        onClick={() => onEdit(goal)} 
                        title={t('edit')}
                        className="p-2.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all"
                    >
                        <Pencil size={18} />
                    </button>
                    <button 
                        onClick={() => onDelete(goal.id)} 
                        title={t('delete')}
                        className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="mt-8 space-y-3">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('goals_progress')}</span>
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {completedTasks} / {linkedTasks.length} {t('goals_completed_tasks')}
                        </div>
                    </div>
                    <span className="text-2xl font-black text-brand-600 dark:text-brand-400 tabular-nums">{Math.round(progress)}%</span>
                </div>
                <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full shadow-[0_0_12px_rgba(var(--brand-600-rgb),0.3)]"
                    />
                </div>
            </div>
        </div>
    );
};

export default GoalItem;
