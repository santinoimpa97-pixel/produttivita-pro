import React from 'react';
import { 
  CheckSquare, 
  Repeat, 
  Target, 
  Calendar, 
  BarChart3,
  StickyNote
} from 'lucide-react';

export type View = 'tasks' | 'routines' | 'goals' | 'calendar' | 'analytics' | 'notes' | 'profile';

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
    className={`flex flex-col items-center justify-center w-full py-2 transition-all duration-300 relative ${
      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400 hover:text-brand-500'
    }`}
  >
    <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-brand-50 dark:bg-brand-900/20' : ''}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <span className={`text-[10px] mt-1 font-semibold tracking-wide uppercase ${isActive ? 'opacity-100' : 'opacity-70'}`}>
      {label}
    </span>
    {isActive && (
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-600 dark:bg-brand-400 rounded-full" />
    )}
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onSetView }) => {
  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'tasks', label: 'Attività', icon: <CheckSquare /> },
    { view: 'routines', label: 'Routine', icon: <Repeat /> },
    { view: 'goals', label: 'Obiettivi', icon: <Target /> },
    { view: 'calendar', label: 'Calendario', icon: <Calendar /> },
    { view: 'notes', label: 'Note', icon: <StickyNote /> },
    { view: 'analytics', label: 'Analytics', icon: <BarChart3 /> },
  ];

  return (
    <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg glass-card border border-slate-200 dark:border-slate-800 z-40 rounded-[2rem] shadow-2xl shadow-brand-500/10">
      <div className="flex items-center justify-around px-2">
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
