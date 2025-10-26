
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types.ts';
import { UserIcon } from './icons/UserIcon.tsx';
import { LogoutIcon } from './icons/LogoutIcon.tsx';
import { ProfileSettingsIcon } from './icons/ProfileSettingsIcon.tsx';
import { View } from './BottomNav.tsx';
import { SunIcon } from './icons/SunIcon.tsx';
import { MoonIcon } from './icons/MoonIcon.tsx';

interface UserMenuProps {
    user: User;
    onLogout: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    onSetView: (view: View) => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, isDarkMode, toggleDarkMode, onSetView }) => {
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
            <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                <UserIcon />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 py-1 z-20">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Accesso come</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{user.displayName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                        <button onClick={handleProfileClick} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3">
                            <ProfileSettingsIcon className="w-5 h-5" />
                            Il mio Profilo
                        </button>
                         <button onClick={toggleDarkMode} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3">
                            {isDarkMode ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
                            {isDarkMode ? 'Tema Chiaro' : 'Tema Scuro'}
                        </button>
                    </div>
                     <div className="py-1 border-t border-slate-200 dark:border-slate-700">
                        <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3">
                            <LogoutIcon className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
