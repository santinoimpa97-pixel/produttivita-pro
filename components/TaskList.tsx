
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import TaskItem from './TaskItem';

export interface TaskListProps {
  tasks: Task[];
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

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
  onUpdateSubTask,
  onGenerateSubtasks,
  generatingTaskId,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <p className="text-slate-400 dark:text-slate-500 font-medium italic">
          Nessuna attività in questa categoria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onUpdate={onUpdateTask}
            onAddSubTask={onAddSubTask}
            onToggleSubTask={onToggleSubTask}
            onDeleteSubTask={onDeleteSubTask}
            onUpdateSubTask={onUpdateSubTask}
            onGenerateSubtasks={onGenerateSubtasks}
            isGenerating={generatingTaskId === task.id}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;
