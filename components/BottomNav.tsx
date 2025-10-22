import React from 'react';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { RoutineIcon } from './icons/RoutineIcon';
import { GoalIcon } from './icons/GoalIcon';

export type View = 'tasks' | 'routines' | 'goals' | 'calendar' | 'analytics' | 'profile';

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
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400'
    }`}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onSetView }) => {
  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'tasks', label: 'Attività', icon: <ChecklistIcon /> },
    { view: 'routines', label: 'Routine', icon: <RoutineIcon /> },
    { view: 'goals', label: 'Obiettivi', icon: <GoalIcon /> },
    { view: 'calendar', label: 'Calendario', icon: <CalendarIcon /> },
    { view: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 shadow-[0_-2px_5px_rgba(0,0,0,0.1)] z-20">
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