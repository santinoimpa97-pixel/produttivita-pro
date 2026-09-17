import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  CheckCircle2, 
  Calendar, 
  Target, 
  FileText, 
  Sparkles, 
  Sun, 
  Moon, 
  ArrowRight, 
  Command, 
  CornerDownLeft, 
  LayoutDashboard, 
  Repeat, 
  Bot, 
  User,
  Plus
} from 'lucide-react';
import { Task, Note, Goal, Appointment } from '../types';
import { View } from './BottomNav';
import { useLanguage } from '../LanguageContext';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
  tasks: Task[];
  notes: Note[];
  goals: Goal[];
  appointments: Appointment[];
  onAddTask?: (text: string) => void;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
  onPlanDay?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'action' | 'navigation' | 'task' | 'note' | 'goal' | 'appointment';
  icon: React.ReactNode;
  onSelect: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  tasks,
  notes,
  goals,
  appointments,
  onAddTask,
  onToggleDarkMode,
  isDarkMode,
  onPlanDay,
}) => {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build items list
  const items: CommandItem[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    const result: CommandItem[] = [];

    // Quick Task creation if user typed something
    if (q && onAddTask) {
      result.push({
        id: 'create-task-quick',
        title: `${language === 'en' ? 'Create task' : 'Crea attività'}: "${query}"`,
        subtitle: language === 'en' ? 'Add directly to your tasks' : 'Aggiungi direttamente alla lista',
        category: 'action',
        icon: <Plus className="w-4 h-4 text-emerald-500" />,
        onSelect: () => {
          onAddTask(query.trim());
          onClose();
        },
      });
    }

    // AI Day Planner action
    if (onPlanDay && (!q || 'pianifica plan day ia ai'.includes(q))) {
      result.push({
        id: 'action-plan-day',
        title: language === 'en' ? '✨ Plan Day with AI' : '✨ Pianifica Giornata con IA',
        subtitle: language === 'en' ? 'Auto-organize schedule & time-blocks' : 'Ottimizza time-blocking e priorità',
        category: 'action',
        icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
        onSelect: () => {
          onPlanDay();
          onClose();
        },
      });
    }

    // Navigation items
    const navs: { id: View; label: string; icon: React.ReactNode }[] = [
      { id: 'dashboard', label: t('nav_dashboard') || 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 text-blue-500" /> },
      { id: 'tasks', label: t('nav_tasks') || 'Attività', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
      { id: 'routines', label: t('nav_routines') || 'Routine', icon: <Repeat className="w-4 h-4 text-amber-500" /> },
      { id: 'calendar', label: t('nav_calendar') || 'Calendario', icon: <Calendar className="w-4 h-4 text-purple-500" /> },
      { id: 'goals', label: t('nav_goals') || 'Obiettivi', icon: <Target className="w-4 h-4 text-rose-500" /> },
      { id: 'notes', label: t('nav_notes') || 'Note', icon: <FileText className="w-4 h-4 text-amber-500" /> },
      { id: 'assistant', label: t('nav_assistant') || 'AI Coach', icon: <Bot className="w-4 h-4 text-indigo-500" /> },
      { id: 'profile', label: t('nav_profile') || 'Profilo', icon: <User className="w-4 h-4 text-slate-500" /> },
    ];

    navs.forEach(nav => {
      if (!q || nav.label.toLowerCase().includes(q)) {
        result.push({
          id: `nav-${nav.id}`,
          title: nav.label,
          subtitle: language === 'en' ? `Navigate to ${nav.label}` : `Vai a ${nav.label}`,
          category: 'navigation',
          icon: nav.icon,
          onSelect: () => {
            onNavigate(nav.id);
            onClose();
          },
        });
      }
    });

    // Theme toggle
    if (onToggleDarkMode && (!q || 'tema theme dark light scuro chiaro'.includes(q))) {
      result.push({
        id: 'toggle-theme',
        title: isDarkMode ? (language === 'en' ? 'Light Mode' : 'Tema Chiaro') : (language === 'en' ? 'Dark Mode' : 'Tema Scuro'),
        subtitle: language === 'en' ? 'Toggle application theme' : 'Cambia aspetto dell\'app',
        category: 'action',
        icon: isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />,
        onSelect: () => {
          onToggleDarkMode();
          onClose();
        },
      });
    }

    // Matching Tasks
    if (q) {
      tasks
        .filter(task => task.text.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach(task => {
          result.push({
            id: `task-${task.id}`,
            title: task.text,
            subtitle: `${language === 'en' ? 'Priority' : 'Priorità'}: ${task.priority}${task.dueDate ? ` • ${task.dueDate}` : ''}`,
            category: 'task',
            icon: <CheckCircle2 className={`w-4 h-4 ${task.completed ? 'text-slate-400 line-through' : 'text-emerald-500'}`} />,
            onSelect: () => {
              onNavigate('tasks');
              onClose();
            },
          });
        });

      // Matching Notes
      notes
        .filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach(note => {
          result.push({
            id: `note-${note.id}`,
            title: note.title,
            subtitle: note.content.slice(0, 60),
            category: 'note',
            icon: <FileText className="w-4 h-4 text-amber-500" />,
            onSelect: () => {
              onNavigate('notes');
              onClose();
            },
          });
        });

      // Matching Goals
      goals
        .filter(g => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach(goal => {
          result.push({
            id: `goal-${goal.id}`,
            title: goal.title,
            subtitle: goal.description ? goal.description.slice(0, 60) : undefined,
            category: 'goal',
            icon: <Target className="w-4 h-4 text-rose-500" />,
            onSelect: () => {
              onNavigate('goals');
              onClose();
            },
          });
        });

      // Matching Appointments
      appointments
        .filter(a => a.text.toLowerCase().includes(q) || a.date.includes(q))
        .slice(0, 4)
        .forEach(appt => {
          result.push({
            id: `appt-${appt.id}`,
            title: appt.text,
            subtitle: `${appt.date} • ${appt.time}`,
            category: 'appointment',
            icon: <Calendar className="w-4 h-4 text-purple-500" />,
            onSelect: () => {
              onNavigate('calendar');
              onClose();
            },
          });
        });
    }

    return result;
  }, [query, onAddTask, onPlanDay, onNavigate, onClose, t, language, onToggleDarkMode, isDarkMode, tasks, notes, goals, appointments]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [items.length]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].onSelect();
      }
    }
  };

  const getCategoryBadge = (cat: CommandItem['category']) => {
    switch (cat) {
      case 'action':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">Azione</span>;
      case 'navigation':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">Vista</span>;
      case 'task':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">Attività</span>;
      case 'note':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">Nota</span>;
      case 'goal':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">Obiettivo</span>;
      case 'appointment':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">Evento</span>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'en' ? 'Type a command, search tasks, notes, goals...' : 'Cerca attività, note, eventi o digita un comando...'}
                className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 text-base focus:outline-none font-medium"
              />
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-100 dark:bg-slate-800/70 px-2.5 py-1 rounded-xl">
                <span>ESC</span>
              </div>
            </div>

            {/* Results List */}
            <div 
              ref={listRef} 
              className="max-h-96 overflow-y-auto p-2.5 space-y-1 custom-scrollbar"
            >
              {items.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold">
                    {language === 'en' ? 'No results found' : 'Nessun risultato trovato'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'en' ? 'Try searching for tasks, notes, or views' : 'Prova a cercare un\'attività, una nota o una vista'}
                  </p>
                </div>
              ) : (
                items.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={item.onSelect}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-3 transition-colors ${
                        isSelected 
                          ? 'bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/20 text-blue-600 dark:text-blue-400' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0">
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate leading-tight">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {getCategoryBadge(item.category)}
                        {isSelected && (
                          <CornerDownLeft className="w-4 h-4 text-blue-500 shrink-0 opacity-80" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-200/70 dark:bg-slate-800 rounded text-[10px] font-bold">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-200/70 dark:bg-slate-800 rounded text-[10px] font-bold">↓</kbd>
                  <span className="ml-1">{language === 'en' ? 'Navigate' : 'Naviga'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-200/70 dark:bg-slate-800 rounded text-[10px] font-bold">↵</kbd>
                  <span className="ml-1">{language === 'en' ? 'Select' : 'Seleziona'}</span>
                </span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-slate-400">
                <Command className="w-3.5 h-3.5" />
                <span>+ K</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandMenu;
