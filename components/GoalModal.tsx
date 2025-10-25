import React, { useState, useEffect } from 'react';
import { Goal } from '../types';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goalData: Omit<Goal, 'id' | 'completed' | 'linkedTaskIds'> & { id?: string }) => void;
    goalToEdit: Goal | null;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave, goalToEdit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetDate, setTargetDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle(goalToEdit?.title || '');
            setDescription(goalToEdit?.description || '');
            setTargetDate(goalToEdit?.targetDate || '');
        }
    }, [goalToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: goalToEdit?.id, title, description, targetDate: targetDate || null });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-lg m-auto flex flex-col max-h-[90vh]">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <h2 className="text-xl font-bold">{goalToEdit ? 'Modifica Obiettivo' : 'Nuovo Obiettivo'}</h2>
                        <div>
                            <label htmlFor="goal-title" className="block text-sm font-medium mb-1">Titolo</label>
                            <input id="goal-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Imparare a suonare la chitarra" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500" required />
                        </div>
                        <div>
                            <label htmlFor="goal-description" className="block text-sm font-medium mb-1">Descrizione</label>
                            <textarea id="goal-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrivi i passi o la motivazione." rows={3} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500" />
                        </div>
                        <div>
                            <label htmlFor="goal-target-date" className="block text-sm font-medium mb-1">Data Target (Opzionale)</label>
                            <input id="goal-target-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500" />
                        </div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 px-6 py-3 flex justify-end gap-3 rounded-b-xl mt-auto">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 font-semibold rounded-lg hover:bg-slate-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default GoalModal;
