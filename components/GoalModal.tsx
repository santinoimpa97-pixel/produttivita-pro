import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar, AlignLeft, Save, Sparkles } from 'lucide-react';
import { Goal } from '../types';
import { useLanguage } from '../App';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goalData: Omit<Goal, 'id' | 'completed' | 'linkedTaskIds'> & { id?: string }) => void;
    goalToEdit: Goal | null;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave, goalToEdit }) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetDate, setTargetDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (goalToEdit) {
                setTitle(goalToEdit.title);
                setDescription(goalToEdit.description);
                setTargetDate(goalToEdit.targetDate || '');
            } else {
                setTitle('');
                setDescription('');
                setTargetDate('');
            }
        }
    }, [goalToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: goalToEdit?.id,
            title,
            description,
            targetDate: targetDate || null,
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-brand-500/10 overflow-hidden border border-slate-100 dark:border-slate-800/50"
                    >
                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-brand-500 bg-opacity-10 dark:bg-opacity-20 text-brand-600">
                                        <Target size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                            {goalToEdit ? t('goals_edit') : t('goals_new')}
                                        </h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t('goals_define')}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="goal-title" className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t('goals_title_label')}</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                            <Sparkles size={18} />
                                        </div>
                                        <input
                                            id="goal-title"
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={t('goals_title_placeholder')}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="goal-description" className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t('goals_description')}</label>
                                    <div className="relative group">
                                        <div className="absolute top-3 left-4 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                            <AlignLeft size={18} />
                                        </div>
                                        <textarea
                                            id="goal-description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder={t('goals_desc_placeholder')}
                                            rows={3}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="goal-target-date" className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t('goals_target_date')}</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                            <Calendar size={18} />
                                        </div>
                                        <input
                                            id="goal-target-date"
                                            type="date"
                                            value={targetDate}
                                            onChange={(e) => setTargetDate(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={onClose} 
                                        className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 px-6 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                    >
                                        <Save size={18} />
                                        {t('goals_save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GoalModal;
