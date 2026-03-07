import React, { useState } from 'react';
import { Priority } from '../types';
import { Plus, Calendar, Flag } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface TaskInputProps {
  onAddTask: (text: string, priority: Priority, dueDate: string | null) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTask(text.trim(), priority, dueDate || null);
      setText('');
      setPriority(Priority.Medium);
      setDueDate('');
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl shadow-xl shadow-brand-500/5">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="task-text" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t('tasks_add_placeholder')}</label>
          <input
            id="task-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('tasks_add_placeholder')}
            className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all font-medium"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 min-w-0">
            <label htmlFor="due-date" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-1">
              <Calendar size={12} /> {t('tasks_due_date')}
            </label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full min-w-0 appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-xl text-slate-900 dark:text-white focus:outline-none transition-all text-sm"
            />
          </div>
          <div className="space-y-2 min-w-0">
            <label htmlFor="priority" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-1">
              <Flag size={12} /> {t('tasks_priority')}
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-xl text-slate-900 dark:text-white focus:outline-none transition-all text-sm appearance-none cursor-pointer"
            >
              <option value={Priority.High}>{t('tasks_priority_high')}</option>
              <option value={Priority.Medium}>{t('tasks_priority_medium')}</option>
              <option value={Priority.Low}>{t('tasks_priority_low')}</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
        >
          <Plus size={20} strokeWidth={3} />
          {t('tasks_add_button')}
        </button>
      </form>
    </div>
  );
};

export default TaskInput;
