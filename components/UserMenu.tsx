import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Sun, 
  Moon,
  ChevronDown
} from 'lucide-react';
import { View } from './BottomNav';
import { useLanguage } from '../LanguageContext';

interface UserMenuProps {
    user: User;
    onLogout: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    onSetView: (view: View) => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, isDarkMode, toggleDarkMode, onSetView }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        onSetView('profile');
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
            >
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-sm">
                    <UserIcon size={18} />
                </div>
                <span className="hidden sm:block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {user.displayName.split(' ')[0]}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 glass-card rounded-2xl shadow-2xl ring-1 ring-black/5 py-2 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Account</p>
                        <p className="font-bold text-slate-900 dark:text-white truncate mt-1">{user.displayName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    
                    <div className="p-1">
                        <button onClick={handleProfileClick} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl flex items-center gap-3 transition-colors">
                            <Settings size={18} />
                            {t('menu_profile_settings')}
                        </button>
                         <button onClick={toggleDarkMode} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl flex items-center gap-3 transition-colors">
                            {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
                            {isDarkMode ? t('menu_theme_light') : t('menu_theme_dark')}
                        </button>
                    </div>
                    
                    <div className="p-1 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={onLogout} className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl flex items-center gap-3 transition-colors">
                            <LogOut size={18} />
                            {t('menu_logout')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
