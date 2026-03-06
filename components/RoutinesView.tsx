import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Sparkles, ChevronDown, Bookmark, RotateCcw, CheckCircle2, Circle, ListTodo, LayoutGrid } from 'lucide-react';
import { Routine, RoutineTemplate, RoutineTask } from '../types';
import { useLanguage } from '../App';

interface RoutinesViewProps {
    routines: Routine[];
    templates: RoutineTemplate[];
    onAddRoutine: (name: string) => void;
    onDeleteRoutine: (id: string) => void;
    onAddRoutineTask: (routineId: string, taskText: string) => void;
    onDeleteRoutineTask: (routineId: string, taskId: string) => void;
    onToggleRoutineTask: (routineId: string, taskId: string) => void;
    onResetRoutine: (routineId: string) => void;
    onGenerateTasks: (routineId: string, routineName: string) => void;
    generatingRoutineId: string | null;
    onSaveAsTemplate: (routineId: string) => void;
    onCreateFromTemplate: (templateId: string) => void;
    onDeleteTemplate: (templateId: string) => void;
}

const RoutineItem: React.FC<{
    routine: Routine;
    onDelete: (id: string) => void;
    onAddTask: (routineId: string, taskText: string) => void;
    onDeleteTask: (routineId: string, taskId: string) => void;
    onToggleTask: (routineId: string, taskId: string) => void;
    onReset: (routineId: string) => void;
    onGenerate: (routineId: string, routineName: string) => void;
    isGenerating: boolean;
    onSave: (routineId: string) => void;
}> = ({ routine, onDelete, onAddTask, onDeleteTask, onToggleTask, onReset, onGenerate, isGenerating, onSave }) => {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if(newTaskText.trim()) {
            onAddTask(routine.id, newTaskText.trim());
            setNewTaskText('');
        }
    }
    
    const hasCompletedTasks = routine.tasks.some(t => t.completed);
    const completedCount = routine.tasks.filter(t => t.completed).length;
    const progress = routine.tasks.length > 0 ? (completedCount / routine.tasks.length) * 100 : 0;

    return (
        <div className="glass-card rounded-[2rem] border border-slate-100 dark:border-slate-800/50 overflow-hidden transition-all group">
            <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{routine.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{routine.tasks.length} {t('routines_add_button').toLowerCase()}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">{Math.round(progress)}% {t('nav_tasks').toLowerCase()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl">
                        <button onClick={() => onSave(routine.id)} title={t('routines_save_template')} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-all"><Bookmark size={18} /></button>
                        <button onClick={() => onDelete(routine.id)} title={t('delete')} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 size={18} /></button>
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)} 
                            className={`p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-all ${isExpanded ? 'rotate-180 text-brand-600 bg-brand-50 dark:bg-brand-900/20' : ''}`}
                        >
                            <ChevronDown size={18} />
                        </button>
                    </div>
                </div>

                <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-brand-600 rounded-full"
                    />
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/20"
                    >
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('nav_tasks')}</h4>
                                {routine.tasks.length > 0 && (
                                    <button
                                        onClick={() => onReset(routine.id)}
                                        disabled={!hasCompletedTasks}
                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed transition-all"
                                    >
                                        <RotateCcw size={12} />
                                        {t('routines_reset')}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {routine.tasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group/task hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3 flex-grow">
                                            <button 
                                                onClick={() => onToggleTask(routine.id, task.id)}
                                                className={`transition-all ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-brand-500'}`}
                                            >
                                                {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                            </button>
                                            <span className={`text-sm font-medium transition-all ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {task.text}
                                            </span>
                                        </div>
                                        <button onClick={() => onDeleteTask(routine.id, task.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover/task:opacity-100 transition-all">
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                ))}
                                {routine.tasks.length === 0 && (
                                    <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                        <p className="text-xs font-medium text-slate-400 italic">{t('routines_empty')}</p>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleAddTask} className="flex items-center gap-2 pt-2">
                                <input 
                                    type="text" 
                                    value={newTaskText} 
                                    onChange={e => setNewTaskText(e.target.value)} 
                                    placeholder={t('routines_add_placeholder')} 
                                    className="flex-grow px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-brand-500 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none transition-all"
                                />
                                <button type="submit" className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-95">
                                    <Plus size={20} strokeWidth={3} />
                                </button>
                            </form>

                            <button 
                                onClick={() => onGenerate(routine.id, routine.name)} 
                                disabled={isGenerating} 
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-bold rounded-2xl hover:bg-brand-100 dark:hover:bg-brand-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-[10px]"
                            >
                                {isGenerating ? (
                                    <>{t('loading')}</>
                                ) : (
                                    <><Sparkles size={16} className="text-brand-500" /> {t('routines_generate')}</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const RoutineItemComponent = RoutineItem;

const TemplateItem: React.FC<{
    template: RoutineTemplate;
    onCreate: (templateId: string) => void;
    onDelete: (templateId: string) => void;
}> = ({ template, onCreate, onDelete }) => {
    const { t } = useLanguage();
    return (
        <div className="glass-card p-5 rounded-3xl border border-slate-100 dark:border-slate-800/50 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">{template.name}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{template.tasks.length} {t('nav_tasks').toLowerCase()}</p>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => onCreate(template.id)} title={t('routines_create_from_template')} className="p-2.5 text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-lg shadow-brand-500/20 transition-all active:scale-95"><Plus size={16} strokeWidth={3} /></button>
                    <button onClick={() => onDelete(template.id)} title={t('delete')} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><Trash2 size={16} /></button>
                </div>
            </div>
        </div>
    );
};

const RoutinesView: React.FC<RoutinesViewProps> = (props) => {
    const { t } = useLanguage();
    const [newRoutineName, setNewRoutineName] = useState('');

    const handleAddRoutine = (e: React.FormEvent) => {
        e.preventDefault();
        if(newRoutineName.trim()){
            props.onAddRoutine(newRoutineName.trim());
            setNewRoutineName('');
        }
    };

    return (
    <div className="space-y-10">
        <section className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <RotateCcw className="text-brand-600" size={28} />
                    {t('routines_header')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('routines_subtitle')}</p>
            </div>
            
            <div className="glass-card p-6 rounded-[2.5rem] shadow-xl shadow-brand-500/5">
                <form onSubmit={handleAddRoutine} className="flex items-center gap-3">
                    <div className="flex-grow relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                            <ListTodo size={18} />
                        </div>
                        <input 
                            type="text" 
                            value={newRoutineName} 
                            onChange={e => setNewRoutineName(e.target.value)} 
                            placeholder={t('routines_add_placeholder')} 
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all" 
                            required
                        />
                    </div>
                    <button type="submit" className="px-6 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs">
                        {t('routines_add_button')}
                    </button>
                </form>
            </div>
        </section>

        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('routines_title')}</h3>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">{props.routines.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {props.routines.length > 0 ? (
                        props.routines.map((routine, index) => 
                            <motion.div
                                key={routine.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <RoutineItem 
                                    routine={routine}
                                    onDelete={props.onDeleteRoutine}
                                    onAddTask={props.onAddRoutineTask}
                                    onDeleteTask={props.onDeleteRoutineTask}
                                    onToggleTask={props.onToggleRoutineTask}
                                    onReset={props.onResetRoutine}
                                    onGenerate={props.onGenerateTasks}
                                    isGenerating={props.generatingRoutineId === routine.id}
                                    onSave={props.onSaveAsTemplate}
                                />
                            </motion.div>
                        )
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 px-4 glass-card rounded-[2.5rem] border-dashed border-2 border-slate-200 dark:border-slate-800"
                        >
                            <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <RotateCcw className="text-slate-400" size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('routines_empty')}</h4>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm font-medium">{t('routines_add_button')}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>

        {props.templates.length > 0 && (
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('routines_templates')}</h3>
                    <LayoutGrid size={16} className="text-slate-400" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {props.templates.map(template => 
                        <TemplateItem 
                            key={template.id}
                            template={template}
                            onCreate={props.onCreateFromTemplate}
                            onDelete={props.onDeleteTemplate}
                        />
                    )}
                </div>
            </section>
        )}
    </div>
  );
};

export default RoutinesView;
