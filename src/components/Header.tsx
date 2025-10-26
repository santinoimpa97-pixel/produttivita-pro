
import React from 'react';
import UserMenu from './UserMenu.tsx';
import { User } from '../types.ts';
import { View } from './BottomNav.tsx';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    onSetView: (view: View) => void;
    subtitle: string;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, isDarkMode, toggleDarkMode, onSetView, subtitle }) => {
    return (
        <header className="bg-white/70 dark:bg-[#020617] backdrop-blur-lg sticky top-0 z-10 p-4 shadow-sm">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Produttività Pro</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic animate-fade-in">{subtitle}</p>
                </div>
                <div className="flex items-center gap-4">
                    {user && <UserMenu user={user} onLogout={onLogout} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} onSetView={onSetView} />}
                </div>
            </div>
        </header>
    );
};

export default Header;
