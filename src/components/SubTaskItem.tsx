
import React, { useState, useRef, useEffect } from 'react';
import { SubTask } from '../types.ts';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';

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

  useEffect(() => { if (isEditing) inputRef.current?.focus(); }, [isEditing]);

  const handleUpdate = () => {
    if (editText.trim() && editText.trim() !== subTask.text) onUpdate(subTask.id, editText.trim());
    setIsEditing(false);
  };
  
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 group">
      <input type="checkbox" checked={subTask.completed} onChange={() => onToggle(subTask.id)} className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer" />
      {isEditing ? (
        <input ref={inputRef} type="text" value={editText} onChange={(e) => setEditText(e.target.value)} onBlur={handleUpdate} onKeyDown={(e) => e.key === 'Enter' && handleUpdate()} className="flex-grow bg-transparent border-b border-violet-500 focus:outline-none" />
      ) : (
        <span onClick={() => onToggle(subTask.id)} className={`flex-grow cursor-pointer ${subTask.completed ? 'line-through text-slate-400' : ''}`}>{subTask.text}</span>
      )}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
        <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-violet-500"><PencilIcon/></button>
        <button onClick={() => onDelete(subTask.id)} className="text-slate-400 hover:text-red-500"><TrashIcon/></button>
      </div>
    </div>
  );
};
export default SubTaskItem;
