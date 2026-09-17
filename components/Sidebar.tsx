import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Repeat, 
  Target, 
  Calendar, 
  StickyNote, 
  Sparkles, 
  User as UserIcon,
  Sun,
  Moon,
  LogOut,
  Search
} from 'lucide-react';
import { View } from './BottomNav';
import { useLanguage } from '../LanguageContext';
import { User } from '../types';
import BrandLogo from './BrandLogo';

interface SidebarProps {
  currentView: View;
  onSetView: (view: View) => void;
  tasksCountToday?: number;
  user: User;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  onOpenCommandMenu?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSetView,
  tasksCountToday = 0,
  user,
  isDarkMode,
  toggleDarkMode,
  onLogout,
  onOpenCommandMenu,
}) => {
  const { t, language } = useLanguage();

  const navItems = [
    { view: 'dashboard' as View, label: t('nav_dashboard'), icon: LayoutDashboard },
    { view: 'tasks' as View, label: t('nav_tasks'), icon: CheckSquare, badge: tasksCountToday > 0 ? tasksCountToday : undefined },
    { view: 'routines' as View, label: t('nav_routines'), icon: Repeat },
    { view: 'goals' as View, label: t('nav_goals'), icon: Target },
    { view: 'calendar' as View, label: t('nav_calendar'), icon: Calendar },
    { view: 'notes' as View, label: t('nav_notes'), icon: StickyNote },
    { view: 'assistant' as View, label: t('nav_assistant'), icon: Sparkles, highlight: true },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-white/70 dark:bg-slate-950/70 border-r border-slate-200/80 dark:border-slate-800/80 backdrop-blur-2xl z-40 p-5 select-none justify-between">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 py-1">
          <BrandLogo size={38} className="group-hover:scale-105 transition-transform" />
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Produttività <span className="text-brand-600 dark:text-brand-400">Pro</span>
            </h2>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              AI Suite
            </span>
          </div>
        </div>

        {/* Quick Search / Command Palette Trigger */}
        {onOpenCommandMenu && (
          <button
            onClick={onOpenCommandMenu}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-semibold transition-all group shadow-sm hover:border-brand-500/40"
          >
            <div className="flex items-center gap-2">
              <Search size={15} className="group-hover:text-brand-500 transition-colors" />
              <span>{language === 'en' ? 'Quick search...' : 'Cerca rapida...'}</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 shadow-sm">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onSetView(item.view)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : item.highlight ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls & User */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between px-2">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-xs font-bold"
            title={isDarkMode ? t('menu_theme_light') : t('menu_theme_dark')}
          >
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
            <span>{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
            title={t('profile_logout')}
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* User Card */}
        <button
          onClick={() => onSetView('profile')}
          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all ${
            currentView === 'profile' 
              ? 'bg-slate-100 dark:bg-slate-900 ring-2 ring-brand-500' 
              : 'hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon size={16} />}
          </div>
          <div className="text-left truncate flex-1 min-w-0">
            <div className="text-xs font-black text-slate-900 dark:text-white truncate">
              {user.displayName || 'Utente'}
            </div>
            <div className="text-[10px] font-medium text-slate-400 truncate">
              {user.email}
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
