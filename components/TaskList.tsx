import React from 'react';
import { Task } from '../types.js';
import TaskItem from './TaskItem.js';

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

const TaskList: React.FC<TaskListProps> = (props) => {
  if (props.tasks.length === 0) {
    return <div className="text-center py-6"><p className="text-slate-500">Nessuna attività in questa categoria.</p></div>;
  }
  return (
    <div className="space-y-4">
      {props.tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={props.onToggleTask}
          onDelete={props.onDeleteTask}
          onUpdate={props.onUpdateTask}
          onAddSubTask={props.onAddSubTask}
          onToggleSubTask={props.onToggleSubTask}
          onDeleteSubTask={props.onDeleteSubTask}
          onUpdateSubTask={props.onUpdateSubTask}
          onGenerateSubtasks={props.onGenerateSubtasks}
          isGenerating={props.generatingTaskId === task.id}
        />
      ))}
    </div>
  );
};
export default TaskList;