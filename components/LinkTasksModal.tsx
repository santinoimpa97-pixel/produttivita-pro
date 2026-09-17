import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, AlertCircle, Check } from 'lucide-react';
import { Task } from '../types';
import { useLanguage } from '../LanguageContext';

interface LinkTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  linkedTaskIds: string[];
  onToggleLinkTask: (taskId: string) => void;
  goalTitle: string;
}

const LinkTasksModal: React.FC<LinkTasksModalProps> = ({ 
  isOpen, 
  onClose, 
  tasks, 
  linkedTaskIds, 
  onToggleLinkTask, 
  goalTitle 
}) => {
  const { t } = useLanguage();

  // Show all tasks that are either uncompleted OR already linked to this goal
  const displayTasks = tasks.filter(t => !t.completed || linkedTaskIds.includes(t.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]"
          >
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-600">
                    <Link2 size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                      {t('goals_link_tasks')}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {t('goals_link_subtitle')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t('goals_link_select')} <span className="text-brand-600 dark:text-brand-400 font-bold">{goalTitle}</span>
              </p>
            </div>

            <div className="p-6 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
              {displayTasks.length > 0 ? (
                displayTasks.map(task => {
                  const isLinked = linkedTaskIds.includes(task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => onToggleLinkTask(task.id)}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all border-2 text-left ${
                        isLinked 
                          ? 'bg-brand-50/60 dark:bg-brand-950/20 border-brand-500/30 text-slate-900 dark:text-white' 
                          : 'bg-slate-50/50 dark:bg-slate-800/30 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                        isLinked ? 'bg-brand-600 text-white' : 'border-2 border-slate-300 dark:border-slate-600'
                      }`}>
                        {isLinked && <Check size={12} strokeWidth={4} />}
                      </div>
                      <span className={`flex-1 font-semibold text-xs truncate ${task.completed ? 'line-through text-slate-400' : ''}`}>
                        {task.text}
                      </span>
                      {task.completed && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500">
                          {t('tasks_completed')}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                  <AlertCircle size={36} strokeWidth={1.5} />
                  <p className="text-sm font-medium italic text-center max-w-[200px]">{t('goals_link_empty')}</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={onClose} 
                className="w-full py-3.5 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
              >
                {t('goals_done')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LinkTasksModal;
