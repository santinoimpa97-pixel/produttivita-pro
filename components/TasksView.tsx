import React, { useState } from 'react';
import { Task, Priority } from '../types.ts';
import TaskInput from './TaskInput.tsx';
import TaskList from './TaskList.tsx';
import TaskCategory from './TaskCategory.tsx';

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
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);

  const searchedTasks = tasks.filter(task => task.text.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const overdueTasks = searchedTasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) <= yesterday);
  const todayTasks = searchedTasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) > yesterday && new Date(t.dueDate) <= today);
  const upcomingTasks = searchedTasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) > today);
  const noDueDateTasks = searchedTasks.filter(t => !t.completed && !t.dueDate);
  const completedTasks = searchedTasks.filter(t => t.completed);

  return (
    <div className="space-y-6 animate-fade-in">
      <TaskInput onAddTask={onAddTask} />
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg">
        <input type="text" placeholder="Cerca in tutte le attività..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500" />
      </div>
      <div className="space-y-4">
        <TaskCategory title="In Scadenza" tasks={overdueTasks} {...taskListProps} defaultOpen={true} />
        <TaskCategory title="Oggi" tasks={todayTasks} {...taskListProps} defaultOpen={true} />
        <TaskCategory title="Prossimamente" tasks={upcomingTasks} {...taskListProps} />
        <TaskCategory title="Senza Scadenza" tasks={noDueDateTasks} {...taskListProps} />
        <TaskCategory title="Completate" tasks={completedTasks} {...taskListProps} />
      </div>
      {tasks.length === 0 && (
        <div className="text-center py-6 px-4 bg-white dark:bg-slate-900 rounded-xl shadow-md">
            <p className="text-slate-500 dark:text-slate-400">Nessuna attività ancora. Aggiungine una per iniziare!</p>
        </div>
      )}
    </div>
  );
};

export default TasksView;