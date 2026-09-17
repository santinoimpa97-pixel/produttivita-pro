import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Sparkles, ChevronDown, Bookmark, RotateCcw, CheckCircle2, Circle, Repeat, Layers } from 'lucide-react';
import { Routine, RoutineTemplate, RoutineTask } from '../types';
import { useLanguage } from '../LanguageContext';

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if(newTaskText.trim()) {
      onAddTask(routine.id, newTaskText.trim());
      setNewTaskText('');
    }
  };
  
  const hasCompletedTasks = routine.tasks.some(t => t.completed);
  const completedCount = routine.tasks.filter(t => t.completed).length;
  const progress = routine.tasks.length > 0 ? (completedCount / routine.tasks.length) * 100 : 0;

  return (
    <div className="glass-card rounded-[2rem] overflow-hidden transition-all group border border-slate-100 dark:border-slate-800/60 hover:border-brand-500/30">
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              {routine.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {routine.tasks.length} {t('routines_task_count')}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {Math.round(progress)}% {t('tasks_completed').toLowerCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => onSave(routine.id)} 
              title={t('routines_save_template')} 
              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <Bookmark size={16} />
            </button>
            <button 
              onClick={() => onDelete(routine.id)} 
              title={t('delete')} 
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className={`p-2 text-slate-400 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all ${isExpanded ? 'rotate-180 text-brand-600' : ''}`}
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-brand-600 to-emerald-400 rounded-full"
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/30"
          >
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t('nav_tasks')}
                </h4>
                {routine.tasks.length > 0 && (
                  <button
                    onClick={() => onReset(routine.id)}
                    disabled={!hasCompletedTasks}
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed transition-all"
                  >
                    <RotateCcw size={13} />
                    {t('routines_reset')}
                  </button>
                )}
              </div>

              {/* Task Items in Routine */}
              <div className="space-y-2">
                {routine.tasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 group/task hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 flex-grow min-w-0 pr-2">
                      <button 
                        onClick={() => onToggleTask(routine.id, task.id)}
                        className={`transition-all shrink-0 ${task.completed ? 'text-brand-600 dark:text-brand-400' : 'text-slate-300 hover:text-brand-500'}`}
                      >
                        {task.completed ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <Circle size={20} strokeWidth={2} />}
                      </button>
                      <span className={`text-sm font-semibold truncate transition-all ${
                        task.completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {task.text}
                      </span>
                    </div>

                    {/* Touch friendly delete button: always visible on mobile, reveal on hover on desktop */}
                    <button 
                      onClick={() => onDeleteTask(routine.id, task.id)} 
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl opacity-100 sm:opacity-0 sm:group-hover/task:opacity-100 transition-all shrink-0"
                      title={t('delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Routine Task Form */}
              <form onSubmit={handleAddTask} className="flex items-center gap-2 pt-1">
                <input 
                  type="text" 
                  value={newTaskText} 
                  onChange={e => setNewTaskText(e.target.value)} 
                  placeholder={t('tasks_add_subtask')} 
                  className="flex-grow px-4 py-2.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-brand-500 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:outline-none transition-all"
                />
                <button 
                  type="submit" 
                  className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-sm transition-all"
                  title={t('tasks_add_button')}
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              </form>

              {/* AI Routine Task Generator */}
              <button
                onClick={() => onGenerate(routine.id, routine.name)}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600/10 hover:bg-brand-600/15 text-brand-600 dark:text-brand-400 font-bold rounded-2xl border border-brand-500/20 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    {t('tasks_generating')}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {t('routines_generate')}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RoutinesView: React.FC<RoutinesViewProps> = (props) => {
  const { t } = useLanguage();
  const [newRoutineName, setNewRoutineName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if(newRoutineName.trim()) {
      props.onAddRoutine(newRoutineName.trim());
      setNewRoutineName('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Add Form */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Repeat className="text-brand-600" size={26} />
            {t('routines_title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            {t('routines_subtitle')}
          </p>
        </div>

        <div className="glass-card p-5 sm:p-6 rounded-[2.5rem]">
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={newRoutineName} 
              onChange={e => setNewRoutineName(e.target.value)} 
              placeholder={t('routines_add_placeholder')} 
              className="flex-grow px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all text-sm"
              required 
            />
            <button 
              type="submit" 
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-xs shrink-0"
            >
              <Plus size={18} strokeWidth={3} /> {t('routines_add_button')}
            </button>
          </form>
        </div>
      </section>

      {/* Routine Templates Section if any exist */}
      {props.templates.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Layers size={14} className="text-brand-500" />
            {t('routines_templates')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {props.templates.map(tmpl => (
              <div 
                key={tmpl.id}
                className="glass-card p-4 rounded-2xl flex items-center justify-between gap-3 border border-slate-100 dark:border-slate-800"
              >
                <div className="truncate min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {tmpl.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {tmpl.tasks.length} {t('routines_task_count')}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => props.onCreateFromTemplate(tmpl.id)}
                    className="px-3 py-1.5 bg-brand-600 text-white rounded-xl font-bold text-xs hover:bg-brand-700 transition-all shadow-sm"
                  >
                    {t('routines_create_from_template')}
                  </button>
                  <button
                    onClick={() => props.onDeleteTemplate(tmpl.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Routines List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {props.routines.length > 0 ? (
            props.routines.map(routine => (
              <motion.div 
                key={routine.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
            ))
          ) : (
            <div className="text-center py-16 px-4 glass-card rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 font-medium text-sm">
                {t('routines_empty')}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RoutinesView;
