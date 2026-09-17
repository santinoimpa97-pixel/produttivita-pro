import React from 'react';
import UserMenu from './UserMenu';
import { User } from '../types';
import { View } from './BottomNav';
import { Sparkles, Search, RotateCw } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onSetView: (view: View) => void;
  subtitle: string;
  onOpenCommandMenu?: () => void;
  onRefreshQuote?: () => void;
  isRefreshingQuote?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout, 
  isDarkMode, 
  toggleDarkMode, 
  onSetView, 
  subtitle,
  onOpenCommandMenu,
  onRefreshQuote,
  isRefreshingQuote = false,
}) => {
  return (
    <header className="sticky top-0 z-30 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:px-6 bg-white/60 dark:bg-[#070b14]/60 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 select-none">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Mobile Brand / Desktop Title */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onSetView('dashboard')}
            className="flex items-center gap-2 cursor-pointer group md:hidden"
          >
            <BrandLogo size={32} />
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Produttività <span className="text-brand-600 dark:text-brand-400">Pro</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Sparkles size={14} className="text-brand-500 shrink-0" />
            <span className="italic max-w-md truncate">"{subtitle}"</span>
            {onRefreshQuote && (
              <button
                type="button"
                onClick={onRefreshQuote}
                disabled={isRefreshingQuote}
                className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-500 transition-all shrink-0 active:scale-95 disabled:opacity-50"
                title="Genera nuova frase motivazionale con IA"
              >
                <RotateCw size={12} className={isRefreshingQuote ? 'animate-spin text-brand-500' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* User Menu & Actions */}
        <div className="flex items-center gap-2">
          {onOpenCommandMenu && (
            <button
              onClick={onOpenCommandMenu}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              title="Cerca o digita un comando (⌘K)"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Cerca...</span>
              <kbd className="hidden sm:inline px-1 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-[10px] font-mono font-bold">
                ⌘K
              </kbd>
            </button>
          )}

          {user && (
            <UserMenu 
              user={user} 
              onLogout={onLogout} 
              isDarkMode={isDarkMode} 
              toggleDarkMode={toggleDarkMode} 
              onSetView={onSetView} 
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
