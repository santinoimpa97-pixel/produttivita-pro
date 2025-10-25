import React, { useState } from 'react';
import { Priority } from '../types.js';
import { PlusIcon } from './icons/PlusIcon.js';

interface TaskInputProps {
  onAddTask: (text: string, priority: Priority, dueDate: string | null) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
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
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-text" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nuova Attività</label>
          <input id="task-text" type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cosa devi fare?" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500" required />
        </div>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="due-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Scadenza</label>
            <input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500" />
          </div>
          <div className="flex-1">
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priorità</label>
            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500">
              <option value={Priority.High}>Alta</option>
              <option value={Priority.Medium}>Media</option>
              <option value={Priority.Low}>Bassa</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700">
          <PlusIcon className="w-5 h-5"/> Aggiungi Attività
        </button>
      </form>
    </div>
  );
};
export default TaskInput;