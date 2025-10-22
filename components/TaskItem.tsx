
import React, { useState, useRef, useEffect } from 'react';
import { Task, SubTask, Priority } from '../types';
import SubTaskItem from './SubTaskItem';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { PlusIcon } from './icons/PlusIcon';

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

const priorityClasses: Record<Priority, { bg: string, text: string, border: string }> = {
  [Priority.High]: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300', border: 'border-red-500' },
  [Priority.Medium]: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-500' },
  [Priority.Low]: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', border: 'border-green-500' },
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

  const pClasses = priorityClasses[task.priority];

  return (
    <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border-l-4 ${pClasses.border} transition-all duration-300`}>
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="h-6 w-6 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
        />
        <div className="flex-grow">
          {isEditing ? (
             <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleUpdate}
              onKeyDown={handleKeyDown}
              className="w-full text-lg font-semibold bg-transparent text-slate-800 dark:text-slate-100 border-b border-indigo-500 focus:outline-none"
            />
          ) : (
             <p onClick={() => onToggle(task.id)} className={`text-lg font-semibold cursor-pointer text-slate-800 dark:text-slate-100 ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
               {task.text}
             </p>
          )}

          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${pClasses.bg} ${pClasses.text}`}>
              Priorità: {task.priority}
            </span>
            {task.dueDate && (
              <span>Scadenza: {new Date(task.dueDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"><PencilIcon/></button>
          <button onClick={() => onDelete(task.id)} className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"><TrashIcon/></button>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
        <button
          onClick={() => setIsSubtasksVisible(!isSubtasksVisible)}
          className="w-full flex justify-between items-center text-left text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <span>Sotto-attività ({task.subTasks.length})</span>
          <ChevronDownIcon className={`w-5 h-5 transition-transform ${isSubtasksVisible ? 'rotate-180' : ''}`}/>
        </button>

        {isSubtasksVisible && (
          <div className="mt-3 space-y-2">
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
                placeholder="Aggiungi sotto-attività..."
                className="flex-grow px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button type="submit" className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600"><PlusIcon className="w-5 h-5"/></button>
            </form>
            <button
              onClick={() => onGenerateSubtasks(task.id, task.text)}
              disabled={isGenerating}
              className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generazione in corso...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5"/>
                  Genera con IA
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
