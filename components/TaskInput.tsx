import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Priority, Task, TaskHistoryItem } from '../types';
import { Plus, Calendar, Flag, History, Sparkles, Flame, X, ArrowUpRight, Check } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import VoiceButton from './VoiceButton';
import { 
  getTaskHistory, 
  recordTaskInHistory, 
  removeTaskFromHistory 
} from '../services/taskHistoryService';

interface TaskInputProps {
  onAddTask: (text: string, priority: Priority, dueDate: string | null) => void;
  existingTasks?: Task[];
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, existingTasks = [] }) => {
  const { t, language } = useLanguage();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [dueDate, setDueDate] = useState('');

  // Suggestions state
  const [historyList, setHistoryList] = useState<TaskHistoryItem[]>(() => getTaskHistory(existingTasks));
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [justSelected, setJustSelected] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync history if existingTasks change
  useEffect(() => {
    setHistoryList(getTaskHistory(existingTasks));
  }, [existingTasks]);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered matching suggestions when typing
  const filteredSuggestions = useMemo(() => {
    const query = text.trim().toLowerCase();
    if (!query) return [];

    return historyList
      .filter(item => item.text.toLowerCase().includes(query))
      .slice(0, 5);
  }, [historyList, text]);

  // Top frequent suggestions when input is empty and focused
  const frequentSuggestions = useMemo(() => {
    return historyList.slice(0, 4);
  }, [historyList]);

  // Handle selecting a suggestion
  const handleSelectSuggestion = (item: TaskHistoryItem) => {
    setText(item.text);
    if (item.priority) {
      setPriority(item.priority);
    }
    setJustSelected(true);
    setIsFocused(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle removing a suggestion from history
  const handleRemoveItem = (e: React.MouseEvent, itemText: string) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = removeTaskFromHistory(itemText);
    setHistoryList(updated);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        e.preventDefault();
        handleSelectSuggestion(filteredSuggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setSelectedIndex(-1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      const cleanText = text.trim();
      // Record in history
      const updatedHistory = recordTaskInHistory(cleanText, priority);
      setHistoryList(updatedHistory);

      // Trigger callback
      onAddTask(cleanText, priority, dueDate || null);

      // Reset state
      setText('');
      setPriority(Priority.Medium);
      setDueDate('');
      setIsFocused(false);
      setSelectedIndex(-1);
    }
  };

  // Helper for priority badge colors
  const getPriorityBadgeClass = (p: Priority) => {
    switch (p) {
      case Priority.High:
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case Priority.Medium:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case Priority.Low:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div ref={containerRef} className="glass-card p-6 rounded-3xl shadow-xl shadow-brand-500/5 relative">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="task-text" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {t('tasks_add_placeholder')}
            </label>
            {historyList.length > 0 && (
              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                <Sparkles size={11} />
                <span>{language === 'en' ? 'Smart Suggestions Active' : 'Suggerimenti Intelligenti Attivi'}</span>
              </span>
            )}
          </div>

          <div className="relative">
            <input
              ref={inputRef}
              id="task-text"
              type="text"
              autoComplete="off"
              value={text}
              onFocus={() => {
                setIsFocused(true);
                setJustSelected(false);
              }}
              onChange={(e) => {
                setText(e.target.value);
                setIsFocused(true);
                setSelectedIndex(-1);
                setJustSelected(false);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('tasks_add_placeholder')}
              className="w-full pl-5 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all font-medium text-sm"
              required
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <VoiceButton onTranscript={(spoken) => setText(prev => prev ? `${prev} ${spoken}` : spoken)} />
            </div>

            {/* LIVE AUTOCOMPLETE DROPDOWN */}
            <AnimatePresence>
              {isFocused && !justSelected && text.trim().length > 0 && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-2 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-2xl p-2 space-y-1 overflow-hidden"
                >
                  <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    <span className="flex items-center gap-1.5">
                      <History size={12} className="text-brand-500" />
                      <span>{language === 'en' ? 'From your past activities' : 'Dalla tua cronologia attività'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {language === 'en' ? 'Use ↑↓ arrows + Enter' : 'Usa ↑↓ + Invio'}
                    </span>
                  </div>

                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      return (
                        <div
                          key={`sugg-${item.text}-${idx}`}
                          onClick={() => handleSelectSuggestion(item)}
                          className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer group ${
                            isSelected
                              ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              item.count >= 3 
                                ? 'bg-amber-500/10 text-amber-500' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {item.count >= 3 ? <Flame size={14} /> : <History size={14} />}
                            </div>

                            <div className="min-w-0 truncate">
                              <span className="text-xs font-bold truncate block">
                                {item.text}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.count > 1 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
                                {item.count}x
                              </span>
                            )}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${getPriorityBadgeClass(item.priority)}`}>
                              {item.priority}
                            </span>
                            
                            {/* Delete from history button */}
                            <button
                              type="button"
                              title={language === 'en' ? 'Remove from history' : 'Rimuovi dai suggerimenti'}
                              onClick={(e) => handleRemoveItem(e, item.text)}
                              className="w-5 h-5 rounded-md flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* QUICK FREQUENT SUGGESTIONS CHIPS (When input is empty & focused or just opened) */}
          <AnimatePresence>
            {isFocused && text.trim().length === 0 && frequentSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-2"
              >
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-500" />
                      <span>{language === 'en' ? 'Suggested from your frequent tasks:' : 'Attività frequenti suggerite:'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {language === 'en' ? 'Click to fill' : 'Clicca per inserire'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {frequentSuggestions.map((item, idx) => (
                      <button
                        key={`chip-${item.text}-${idx}`}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all group"
                      >
                        <span className="text-slate-400 group-hover:text-brand-500 transition-colors">
                          {item.count >= 3 ? <Flame size={12} className="text-amber-500" /> : <History size={12} />}
                        </span>
                        <span>{item.text}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${getPriorityBadgeClass(item.priority)}`}>
                          {item.priority}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 min-w-0">
            <label htmlFor="due-date" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-1">
              <Calendar size={12} /> {t('tasks_due_date')}
            </label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full min-w-0 appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-xl text-slate-900 dark:text-white focus:outline-none transition-all text-sm"
            />
          </div>
          <div className="space-y-2 min-w-0">
            <label htmlFor="priority" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-1">
              <Flag size={12} /> {t('tasks_priority')}
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-xl text-slate-900 dark:text-white focus:outline-none transition-all text-sm appearance-none cursor-pointer"
            >
              <option value={Priority.High}>{t('tasks_priority_high')}</option>
              <option value={Priority.Medium}>{t('tasks_priority_medium')}</option>
              <option value={Priority.Low}>{t('tasks_priority_low')}</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
        >
          <Plus size={20} strokeWidth={3} />
          {t('tasks_add_button')}
        </button>
      </form>
    </div>
  );
};

export default TaskInput;
