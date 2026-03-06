
import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Edit2, CheckCircle2, Circle } from 'lucide-react';
import { SubTask } from '../types';

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
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
      <button 
        onClick={() => onToggle(subTask.id)}
        className={`transition-colors duration-200 ${subTask.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-brand-500'}`}
      >
        {subTask.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 border-b-2 border-brand-500 focus:outline-none py-0.5"
        />
      ) : (
        <span 
          onClick={() => onToggle(subTask.id)}
          className={`flex-grow cursor-pointer text-sm font-medium transition-all ${subTask.completed ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'}`}
        >
          {subTask.text}
        </span>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
        <button 
          onClick={() => setIsEditing(true)} 
          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-all"
          title="Modifica"
        >
          <Edit2 size={14}/>
        </button>
        <button 
          onClick={() => onDelete(subTask.id)} 
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          title="Elimina"
        >
          <Trash2 size={14}/>
        </button>
      </div>
    </div>
  );
};

export default SubTaskItem;
