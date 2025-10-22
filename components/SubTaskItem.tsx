
import React, { useState, useRef, useEffect } from 'react';
import { SubTask } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';

interface SubTaskItemProps {
  subTask: SubTask;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newText: string) => void;
}

const SubTaskItem: React.FC<SubTaskItemProps> = ({ subTask, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(subTask.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleUpdate = () => {
    if (editText.trim() && editText.trim() !== subTask.text) {
      onUpdate(subTask.id, editText.trim());
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setEditText(subTask.text);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors group">
      <input
        type="checkbox"
        checked={subTask.completed}
        onChange={() => onToggle(subTask.id)}
        className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
      />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent text-slate-700 dark:text-slate-300 border-b border-violet-500 focus:outline-none"
        />
      ) : (
        <span 
          onClick={() => onToggle(subTask.id)}
          className={`flex-grow cursor-pointer text-slate-700 dark:text-slate-300 ${subTask.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}
        >
          {subTask.text}
        </span>
      )}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-violet-500 dark:hover:text-violet-400"><PencilIcon/></button>
        <button onClick={() => onDelete(subTask.id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400"><TrashIcon/></button>
      </div>
    </div>
  );
};

export default SubTaskItem;