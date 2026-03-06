import React from 'react';
import UserMenu from './UserMenu';
import { User } from '../types';
import { View } from './BottomNav';
import { Sparkles } from 'lucide-react';

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
        <header className="glass-card sticky top-0 z-30 px-4 py-3 sm:px-6">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand-600 p-1.5 rounded-lg shadow-lg shadow-brand-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Produttività <span className="text-brand-600 dark:text-brand-400">Pro</span>
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium italic truncate max-w-[200px] sm:max-w-none">
                        {subtitle}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {user && <UserMenu user={user} onLogout={onLogout} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} onSetView={onSetView} />}
                </div>
            </div>
        </header>
    );
};

export default Header;
