import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter } from 'lucide-react';
import { Task, Priority } from '../types';
import TaskInput from './TaskInput';
import TaskList from './TaskList';
import TaskCategory from './TaskCategory';
import { useLanguage } from '../LanguageContext';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (text: string, priority: Priority, dueDate: string | null) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, newText: string) => void;
  onAddSubTask: (taskId: string, subTaskText: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onDeleteSubTask: (taskId: string, subTaskId: string) => void;
  onUpdateSubTask: (taskId: string, subTaskId: string, newText: string) => void;
  onGenerateSubtasks: (taskId: string, taskText: string) => void;
  generatingTaskId: string | null;
}

const TasksView: React.FC<TasksViewProps> = (props) => {
  const { tasks, onAddTask, ...taskListProps } = props;
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');

  // Local ISO date YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Filter by search & priority
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchTerm, priorityFilter]);

  const overdueTasks = useMemo(() => {
    return filteredTasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr);
  }, [filteredTasks, todayStr]);

  const todayTasks = useMemo(() => {
    return filteredTasks.filter(t => !t.completed && t.dueDate === todayStr);
  }, [filteredTasks, todayStr]);

  const upcomingTasks = useMemo(() => {
    return filteredTasks.filter(t => !t.completed && t.dueDate && t.dueDate > todayStr);
  }, [filteredTasks, todayStr]);

  const noDueDateTasks = useMemo(() => {
    return filteredTasks.filter(t => !t.completed && !t.dueDate);
  }, [filteredTasks]);

  const completedTasks = useMemo(() => {
    return filteredTasks.filter(t => t.completed);
  }, [filteredTasks]);

  return (
    <div className="space-y-8">
      {/* Input New Task */}
      <section>
        <TaskInput onAddTask={onAddTask} />
      </section>

      {/* Search & Priority Filter Bar */}
      <section className="space-y-3">
        <div className="glass-card p-2 rounded-2xl flex items-center gap-2 focus-within:ring-2 focus-within:ring-brand-500 transition-all">
          <div className="pl-3 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder={t('tasks_search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 py-2 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-medium text-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="pr-3 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest"
            >
              {t('cancel')}
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setPriorityFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              priorityFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('tasks_filter_all')}
          </button>
          <button
            onClick={() => setPriorityFilter(Priority.High)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              priorityFilter === Priority.High
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100'
            }`}
          >
            {t('tasks_filter_high')}
          </button>
          <button
            onClick={() => setPriorityFilter(Priority.Medium)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              priorityFilter === Priority.Medium
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
            }`}
          >
            {t('tasks_filter_medium')}
          </button>
          <button
            onClick={() => setPriorityFilter(Priority.Low)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              priorityFilter === Priority.Low
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
            }`}
          >
            {t('tasks_filter_low')}
          </button>
        </div>
      </section>

      {/* Task Categories */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {overdueTasks.length > 0 && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TaskCategory title={t('tasks_overdue')} tasks={overdueTasks} {...taskListProps} defaultOpen={true} />
            </motion.div>
          )}
          
          {todayTasks.length > 0 && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TaskCategory title={t('tasks_today')} tasks={todayTasks} {...taskListProps} defaultOpen={true} />
            </motion.div>
          )}

          {upcomingTasks.length > 0 && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TaskCategory title={t('tasks_upcoming')} tasks={upcomingTasks} {...taskListProps} />
            </motion.div>
          )}

          {noDueDateTasks.length > 0 && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TaskCategory title={t('tasks_no_due_date')} tasks={noDueDateTasks} {...taskListProps} defaultOpen={todayTasks.length === 0 && overdueTasks.length === 0} />
            </motion.div>
          )}

          {completedTasks.length > 0 && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TaskCategory title={t('tasks_completed')} tasks={completedTasks} {...taskListProps} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-4 glass-card rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800"
        >
          <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Plus size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('tasks_empty')}</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm">
            {t('tasks_add_placeholder')}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TasksView;
