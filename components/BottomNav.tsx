import React from 'react';
import { 
  LayoutDashboard,
  CheckSquare, 
  Repeat, 
  Target, 
  Calendar, 
  StickyNote,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export type View = 'dashboard' | 'tasks' | 'routines' | 'goals' | 'calendar' | 'notes' | 'profile' | 'assistant';

interface BottomNavProps {
  currentView: View;
  onSetView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-200 relative ${
      isActive ? 'text-brand-600 dark:text-brand-400 font-black' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
    }`}
  >
    <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-brand-500/15 scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: isActive ? 2.5 : 2 })}
    </div>
    <span className="text-[9px] mt-0.5 tracking-tight truncate max-w-[50px]">
      {label}
    </span>
    {isActive && (
      <div className="absolute -bottom-1 w-1 h-1 bg-brand-600 dark:bg-brand-400 rounded-full" />
    )}
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onSetView }) => {
  const { t } = useLanguage();
  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: t('nav_dashboard'), icon: <LayoutDashboard /> },
    { view: 'tasks', label: t('nav_tasks'), icon: <CheckSquare /> },
    { view: 'routines', label: t('nav_routines'), icon: <Repeat /> },
    { view: 'goals', label: t('nav_goals'), icon: <Target /> },
    { view: 'calendar', label: t('nav_calendar'), icon: <Calendar /> },
    { view: 'notes', label: t('nav_notes'), icon: <StickyNote /> },
    { view: 'assistant', label: t('nav_assistant'), icon: <Sparkles /> },
  ];

  return (
    <footer className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-md bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 z-40 rounded-[2rem] shadow-2xl shadow-slate-900/10 px-2 py-1 select-none">
      <div className="flex items-center justify-around">
        {navItems.map(item => (
          <NavItem
            key={item.view}
            label={item.label}
            icon={item.icon}
            isActive={currentView === item.view}
            onClick={() => onSetView(item.view)}
          />
        ))}
      </div>
    </footer>
  );
};

export default BottomNav;
