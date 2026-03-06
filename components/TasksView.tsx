import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import { Task, Priority } from '../types';
import TaskInput from './TaskInput';
import TaskList from './TaskList';
import TaskCategory from './TaskCategory';
import { useLanguage } from '../App';

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

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);

  const searchedTasks = tasks.filter(task => 
    task.text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const overdueTasks = searchedTasks.filter(
    (task) => !task.completed && task.dueDate && new Date(task.dueDate) <= yesterday
  );

  const todayTasks = searchedTasks.filter(
    (task) => !task.completed && task.dueDate && new Date(task.dueDate) > yesterday && new Date(task.dueDate) <= today
  );

  const upcomingTasks = searchedTasks.filter(
    (task) => !task.completed && task.dueDate && new Date(task.dueDate) > today
  );

  const noDueDateTasks = searchedTasks.filter(
    (task) => !task.completed && !task.dueDate
  );
  
  const completedTasks = searchedTasks.filter((task) => task.completed);

  return (
    <div className="space-y-8">
      <section>
        <TaskInput onAddTask={onAddTask} />
      </section>

      <section className="relative">
        <div className="glass-card p-2 rounded-2xl flex items-center gap-2 group focus-within:ring-2 focus-within:ring-brand-500 transition-all">
          <div className="pl-3 text-slate-400">
            <Search size={20} />
          </div>
          <input
              type="text"
              placeholder={t('tasks_empty')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-2 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-medium"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="pr-3 text-xs font-bold text-brand-600 uppercase tracking-widest"
            >
              {t('cancel')}
            </button>
          )}
        </div>
      </section>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {overdueTasks.length > 0 && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TaskCategory title={t('tasks_overdue')} tasks={overdueTasks} {...taskListProps} defaultOpen={true} />
            </motion.div>
          )}
          
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TaskCategory title={t('nav_tasks')} tasks={todayTasks} {...taskListProps} defaultOpen={true} />
          </motion.div>

          {upcomingTasks.length > 0 && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TaskCategory title={t('tasks_upcoming')} tasks={upcomingTasks} {...taskListProps} />
            </motion.div>
          )}

          {noDueDateTasks.length > 0 && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TaskCategory title={t('tasks_no_due_date')} tasks={noDueDateTasks} {...taskListProps} />
            </motion.div>
          )}

          {completedTasks.length > 0 && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TaskCategory title={t('tasks_completed')} tasks={completedTasks} {...taskListProps} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {tasks.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-4 glass-card rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800"
        >
            <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('tasks_empty')}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {t('tasks_add_placeholder')}
            </p>
        </motion.div>
      )}
    </div>
  );
};

export default TasksView;
