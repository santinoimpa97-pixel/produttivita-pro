
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Edit2, 
  Sparkles, 
  ChevronDown, 
  Plus,
  Calendar,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Task, SubTask, Priority } from '../types';
import SubTaskItem from './SubTaskItem';
import { useLanguage } from '../LanguageContext';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newText: string) => void;
  onAddSubTask: (taskId: string, subTaskText: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onDeleteSubTask: (taskId: string, subTaskId: string) => void;
  onUpdateSubTask: (taskId: string, subTaskId: string, newText: string) => void;
  onGenerateSubtasks: (taskId: string, taskText: string) => void;
  isGenerating: boolean;
}

const priorityConfig: Record<Priority, { bg: string, text: string, border: string, iconColor: string }> = {
  [Priority.High]: { 
    bg: 'bg-red-50 dark:bg-red-900/10', 
    text: 'text-red-700 dark:text-red-400', 
    border: 'border-red-200 dark:border-red-900/30',
    iconColor: 'text-red-500'
  },
  [Priority.Medium]: { 
    bg: 'bg-amber-50 dark:bg-amber-900/10', 
    text: 'text-amber-700 dark:text-amber-400', 
    border: 'border-amber-200 dark:border-amber-900/30',
    iconColor: 'text-amber-500'
  },
  [Priority.Low]: { 
    bg: 'bg-emerald-50 dark:bg-emerald-900/10', 
    text: 'text-emerald-700 dark:text-emerald-400', 
    border: 'border-emerald-200 dark:border-emerald-900/30',
    iconColor: 'text-emerald-500'
  },
};

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onUpdate,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
  onUpdateSubTask,
  onGenerateSubtasks,
  isGenerating
}) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [newSubTaskText, setNewSubTaskText] = useState('');
  const [isSubtasksVisible, setIsSubtasksVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);
  
  const handleUpdate = () => {
    if (editText.trim() && editText.trim() !== task.text) {
      onUpdate(task.id, editText.trim());
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubTaskText.trim()) {
      onAddSubTask(task.id, newSubTaskText.trim());
      setNewSubTaskText('');
    }
  };

  const config = priorityConfig[task.priority];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-card rounded-2xl overflow-hidden group transition-all duration-300 ${task.completed ? 'opacity-75' : 'hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800'}`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => onToggle(task.id)}
            className={`mt-1 transition-colors ${task.completed ? 'text-brand-600' : 'text-slate-300 hover:text-brand-400'}`}
          >
            {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
          </button>
          
          <div className="flex-grow min-w-0">
            {isEditing ? (
               <input
                ref={inputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleUpdate}
                onKeyDown={handleKeyDown}
                className="w-full text-lg font-bold bg-transparent text-slate-900 dark:text-white border-b-2 border-brand-500 focus:outline-none py-0.5"
              />
            ) : (
               <h3 
                onClick={() => onToggle(task.id)} 
                className={`text-lg font-bold cursor-pointer truncate transition-all ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}
               >
                 {task.text}
               </h3>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text} border ${config.border}`}>
                {task.priority}
              </span>
              {task.dueDate && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Calendar size={12} />
                  {new Date(task.dueDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                </span>
              )}
              {task.subTasks.length > 0 && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {task.subTasks.filter(s => s.completed).length}/{task.subTasks.length} {t('tasks_subtasks')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setIsEditing(true)} 
              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all"
              title={t('edit')}
            >
              <Edit2 size={18}/>
            </button>
            <button 
              onClick={() => onDelete(task.id)} 
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              title={t('delete')}
            >
              <Trash2 size={18}/>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsSubtasksVisible(!isSubtasksVisible)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 uppercase tracking-widest transition-colors"
          >
            <ChevronDown size={14} className={`transition-transform duration-300 ${isSubtasksVisible ? 'rotate-180' : ''}`}/>
            {isSubtasksVisible ? t('tasks_hide_details') : t('tasks_show_details')}
          </button>

          <AnimatePresence>
            {isSubtasksVisible && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                  {task.subTasks.map(sub => (
                    <SubTaskItem 
                      key={sub.id} 
                      subTask={sub} 
                      onToggle={(subId) => onToggleSubTask(task.id, subId)}
                      onDelete={(subId) => onDeleteSubTask(task.id, subId)}
                      onUpdate={(subId, newText) => onUpdateSubTask(task.id, subId, newText)}
                    />
                  ))}
                  
                  <form onSubmit={handleAddSubTask} className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newSubTaskText}
                      onChange={(e) => setNewSubTaskText(e.target.value)}
                      placeholder={t('tasks_add_subtask')}
                      className="flex-grow px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-brand-500 rounded-xl text-slate-900 dark:text-white focus:outline-none transition-all"
                    />
                    <button 
                      type="submit" 
                      className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all"
                    >
                      <Plus size={20}/>
                    </button>
                  </form>

                  <button
                    onClick={() => onGenerateSubtasks(task.id, task.text)}
                    disabled={isGenerating}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('tasks_generating')}
                      </>
                    ) : (
                      <>
                        <Sparkles size={16}/>
                        {t('tasks_generate_ai')}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;
