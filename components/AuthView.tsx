import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { User, Lock, Mail, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

type AuthMode = 'login' | 'register' | 'forgotPassword';

const AuthView: React.FC = () => {
    const { t } = useLanguage();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(true);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (!error && !rememberMe) {
                // If not remember me, remove the session from local storage on window close
                window.addEventListener('beforeunload', () => supabase.auth.signOut(), { once: true });
            }
            if (error) setError(error.message);
        } else if (mode === 'register') {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName,
                    },
                },
            });
            if (error) {
                setError(error.message);
            } else if (data.user) {
                setMessage(t('auth_register_success'));
                setMode('login');
            }
        }
        setLoading(false);
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage(t('auth_recover_success'));
        }
        setLoading(false);
    }

    const renderContent = () => {
        if (mode === 'forgotPassword') {
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('auth_recover_title')}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{t('auth_recover_subtitle')}</p>
                    </div>
                     <form onSubmit={handlePasswordReset} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t('auth_email')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white focus:outline-none transition-all font-medium" />
                            </div>
                        </div>
                        {error && <p className="text-sm font-bold text-red-500 text-center">{error}</p>}
                        {message && <p className="text-sm font-bold text-emerald-500 text-center">{message}</p>}
                        <button type="submit" disabled={loading} className="w-full py-4 px-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : t('auth_send_link')}
                        </button>
                    </form>
                     <p className="text-sm text-center text-slate-500 dark:text-slate-400 font-medium">
                        {t('auth_remember_password')}
                        <button onClick={() => { setMode('login'); setError(null); setMessage(null); }} className="font-bold text-brand-600 dark:text-brand-400 hover:underline ml-1">
                            {t('auth_back_login')}
                        </button>
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <div className="bg-brand-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-brand-500/20 mb-4">
                        <Sparkles size={24} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Produttività <span className="text-brand-600">Pro</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{mode === 'login' ? t('auth_welcome_back') : t('auth_start_journey')}</p>
                </div>
                
                <form onSubmit={handleAuth} className="space-y-5">
                    {mode === 'register' && (
                        <div className="space-y-2">
                            <label htmlFor="displayName" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t('auth_display_name')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input id="displayName" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white focus:outline-none transition-all font-medium" />
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t('auth_email')}</label>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white focus:outline-none transition-all font-medium" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password"className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t('auth_password')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white focus:outline-none transition-all font-medium" />
                        </div>
                    </div>
                    
                    {mode === 'login' && (
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={e => setRememberMe(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-brand-600 transition-colors" />
                                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('auth_remember_me')}</span>
                            </label>
                            <button type="button" onClick={() => setMode('forgotPassword')} className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline uppercase tracking-widest">
                                {t('auth_forgot_password')}
                            </button>
                        </div>
                    )}
                    
                    {error && <p className="text-sm font-bold text-red-500 text-center">{error}</p>}
                    {message && <p className="text-sm font-bold text-emerald-500 text-center">{message}</p>}

                    <button type="submit" disabled={loading} className="w-full py-4 px-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm group">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                {mode === 'login' ? t('auth_login') : t('auth_create_account')}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-sm text-center text-slate-500 dark:text-slate-400 font-medium">
                    {mode === 'login' ? t('auth_no_account') : t('auth_has_account')}
                    <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setMessage(null); }} className="font-bold text-brand-600 dark:text-brand-400 hover:underline ml-1">
                        {mode === 'login' ? t('auth_register') : t('auth_login')}
                    </button>
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-brand-600" />
               {renderContent()}
            </div>
        </div>
    );
};

export default AuthView;
