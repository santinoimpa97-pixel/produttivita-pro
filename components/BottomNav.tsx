import React, { useState } from 'react';
import { 
  LayoutDashboard,
  CheckSquare, 
  Dumbbell,
  Repeat, 
  Target, 
  Calendar, 
  StickyNote,
  Sparkles,
  Grid,
  X,
  User as UserIcon,
  Sun,
  Moon,
  Search,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../LanguageContext';

export type View = 'dashboard' | 'tasks' | 'fitness' | 'routines' | 'goals' | 'calendar' | 'notes' | 'profile' | 'assistant';

interface BottomNavProps {
  currentView: View;
  onSetView: (view: View) => void;
  tasksCountToday?: number;
  onOpenCommandMenu?: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ 
  currentView, 
  onSetView, 
  tasksCountToday = 0,
  onOpenCommandMenu,
  isDarkMode,
  toggleDarkMode
}) => {
  const { t, language } = useLanguage();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Determine if the current view is inside the "More" menu
  const isMoreViewActive = ['routines', 'goals', 'assistant', 'notes', 'profile'].includes(currentView);

  // Active secondary label & icon
  const getMoreButtonInfo = () => {
    switch (currentView) {
      case 'assistant':
        return { label: language === 'en' ? 'AI Coach' : 'Coach IA', icon: <Sparkles size={19} /> };
      case 'routines':
        return { label: t('nav_routines'), icon: <Repeat size={19} /> };
      case 'goals':
        return { label: t('nav_goals'), icon: <Target size={19} /> };
      case 'notes':
        return { label: t('nav_notes'), icon: <StickyNote size={19} /> };
      case 'profile':
        return { label: language === 'en' ? 'Profile' : 'Profilo', icon: <UserIcon size={19} /> };
      default:
        return { label: language === 'en' ? 'More' : 'Altro', icon: <Grid size={19} /> };
    }
  };

  const moreInfo = getMoreButtonInfo();

  const handleSelectView = (view: View) => {
    onSetView(view);
    setIsMoreMenuOpen(false);
  };

  const moreItems: { view: View; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    { 
      view: 'assistant', 
      label: language === 'en' ? 'AI Coach' : 'Coach IA', 
      desc: language === 'en' ? 'Smart advice & fitness assistant' : 'Consigli intelligenti & assistente',
      icon: <Sparkles size={20} />,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
    },
    { 
      view: 'routines', 
      label: t('nav_routines'), 
      desc: language === 'en' ? 'Habits and daily loops' : 'Abitudini e loop giornalieri',
      icon: <Repeat size={20} />,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    { 
      view: 'goals', 
      label: t('nav_goals'), 
      desc: language === 'en' ? 'Long-term milestones' : 'Traguardi a lungo termine',
      icon: <Target size={20} />,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    },
    { 
      view: 'notes', 
      label: t('nav_notes'), 
      desc: language === 'en' ? 'Quick memos and ideas' : 'Appunti veloci e idee',
      icon: <StickyNote size={20} />,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
    },
    { 
      view: 'profile', 
      label: language === 'en' ? 'Account & Settings' : 'Profilo & Impostazioni', 
      desc: language === 'en' ? 'Manage key, email and preferences' : 'Gestisci chiave Gemini, tema e account',
      icon: <UserIcon size={20} />,
      color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
    },
  ];

  return (
    <>
      {/* Mobile Floating Bottom Bar */}
      <footer className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-md bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 z-40 rounded-[2rem] shadow-2xl shadow-slate-900/10 px-2 py-1.5 select-none">
        <div className="flex items-center justify-between">
          {/* 1. Dashboard */}
          <button
            onClick={() => { setIsMoreMenuOpen(false); onSetView('dashboard'); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              currentView === 'dashboard' ? 'text-brand-600 dark:text-brand-400 font-black' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-2xl transition-all duration-200 ${currentView === 'dashboard' ? 'bg-brand-500/15 scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <LayoutDashboard size={20} strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-extrabold truncate">
              {t('nav_dashboard')}
            </span>
            {currentView === 'dashboard' && (
              <div className="absolute -bottom-1 w-1.5 h-1.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
            )}
          </button>

          {/* 2. Tasks */}
          <button
            onClick={() => { setIsMoreMenuOpen(false); onSetView('tasks'); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              currentView === 'tasks' ? 'text-brand-600 dark:text-brand-400 font-black' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-2xl transition-all duration-200 relative ${currentView === 'tasks' ? 'bg-brand-500/15 scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <CheckSquare size={20} strokeWidth={currentView === 'tasks' ? 2.5 : 2} />
              {tasksCountToday > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                  {tasksCountToday > 9 ? '9+' : tasksCountToday}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-extrabold truncate">
              {t('nav_tasks')}
            </span>
            {currentView === 'tasks' && (
              <div className="absolute -bottom-1 w-1.5 h-1.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
            )}
          </button>

          {/* 3. Fitness */}
          <button
            onClick={() => { setIsMoreMenuOpen(false); onSetView('fitness'); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              currentView === 'fitness' ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-2xl transition-all duration-200 ${currentView === 'fitness' ? 'bg-emerald-500/15 scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <Dumbbell size={20} strokeWidth={currentView === 'fitness' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-extrabold truncate">
              {t('nav_fitness') || 'Palestra'}
            </span>
            {currentView === 'fitness' && (
              <div className="absolute -bottom-1 w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
            )}
          </button>

          {/* 4. Calendar */}
          <button
            onClick={() => { setIsMoreMenuOpen(false); onSetView('calendar'); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              currentView === 'calendar' ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-2xl transition-all duration-200 ${currentView === 'calendar' ? 'bg-blue-500/15 scale-110 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <Calendar size={20} strokeWidth={currentView === 'calendar' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-extrabold truncate">
              {t('nav_calendar') || 'Calendario'}
            </span>
            {currentView === 'calendar' && (
              <div className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
            )}
          </button>

          {/* 5. Altro (Menu Sheet) */}
          <button
            onClick={() => setIsMoreMenuOpen(prev => !prev)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 relative ${
              isMoreViewActive || isMoreMenuOpen
                ? 'text-brand-600 dark:text-brand-400 font-black'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-2xl transition-all duration-200 ${isMoreViewActive || isMoreMenuOpen ? 'bg-brand-500/15 scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              {moreInfo.icon}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-extrabold truncate max-w-[54px]">
              {moreInfo.label}
            </span>
            {(isMoreViewActive || isMoreMenuOpen) && (
              <div className="absolute -bottom-1 w-1.5 h-1.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
            )}
          </button>
        </div>
      </footer>

      {/* Modern Frosted Bottom Sheet for "Altro" Views */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-white dark:bg-[#0b1220] rounded-t-[2.5rem] border-t border-slate-200 dark:border-slate-800 shadow-2xl p-6 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+5rem))] space-y-4 max-h-[85vh] overflow-y-auto"
            >
              {/* Drag Pill Handle */}
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-1 mb-2" />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {language === 'en' ? 'More Sections' : 'Altre Sezioni'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {language === 'en' ? 'Quick navigation to all productivity tools' : 'Navigazione rapida a tutti gli strumenti'}
                  </p>
                </div>
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-1">
                {moreItems.map(item => {
                  const isActive = currentView === item.view;
                  return (
                    <button
                      key={item.view}
                      onClick={() => handleSelectView(item.view)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                        isActive
                          ? 'bg-brand-500/10 dark:bg-brand-500/15 border-brand-500/40 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/20'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm ${item.color}`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className={`text-sm font-black ${isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-900 dark:text-white'}`}>
                            {item.label}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      <ChevronRight size={16} className={`transition-transform ${isActive ? 'text-brand-500 translate-x-0.5' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Bottom Quick Utilities Row */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {onOpenCommandMenu && (
                  <button
                    onClick={() => { setIsMoreMenuOpen(false); onOpenCommandMenu(); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Search size={15} />
                    <span>{language === 'en' ? 'Quick Search' : 'Cerca Rapida (⌘K)'}</span>
                  </button>
                )}

                {toggleDarkMode && (
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Cambia tema"
                  >
                    {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-400" />}
                    <span>{isDarkMode ? 'Chiaro' : 'Scuro'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNav;
