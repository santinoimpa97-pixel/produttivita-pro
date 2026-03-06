import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Mail, Key, LogOut, Save, ShieldCheck, AlertCircle, CheckCircle2, Loader2, Globe } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { User } from '../types';
import { Language } from '../i18n';
import { useLanguage } from '../App';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (displayName: string) => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, onUpdateUser, language, onSetLanguage }) => {
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setError(null);
    setMessage(null);

    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: displayName }
    });

    if (error) {
      setError(error.message);
    } else if (data.user?.user_metadata.display_name) {
      onUpdateUser(data.user.user_metadata.display_name);
      setMessage(t('profile_updated'));
    }
    setLoadingProfile(false);
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if(password !== confirmPassword) {
          setError(t('profile_password_mismatch'));
          return;
      }
      if(password.length < 6) {
          setError(t('profile_password_short'));
          return;
      }

      setLoadingPassword(true);
      setError(null);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        setError(error.message);
      } else {
        setMessage(t('profile_password_updated'));
        setPassword('');
        setConfirmPassword('');
      }
      setLoadingPassword(false);
  };

  return (
    <div className="space-y-10">
        <section className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <UserIcon className="text-brand-600" size={28} />
                    {t('profile_title')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('profile_subtitle')}</p>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] shadow-xl shadow-brand-500/5 space-y-8">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                        <UserIcon size={40} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{user.displayName || 'Utente'}</h3>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500">
                            <Mail size={14} />
                            {user.email}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="displayName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t('profile_display_name')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                <UserIcon size={18} />
                            </div>
                            <input 
                                id="displayName" 
                                type="text" 
                                value={displayName} 
                                onChange={e => setDisplayName(e.target.value)} 
                                required 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all" 
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loadingProfile} 
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                        {loadingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {t('profile_save')}
                    </button>
                </form>
            </div>
        </section>

        {/* Language Selector */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                <Globe size={16} className="text-brand-500" />
                {t('profile_language')}
            </div>
            <div className="glass-card p-6 rounded-[2.5rem] shadow-xl shadow-brand-500/5">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('profile_language_subtitle')}</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => onSetLanguage('it')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                            language === 'it'
                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        🇮🇹 Italiano
                    </button>
                    <button
                        onClick={() => onSetLanguage('en')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                            language === 'en'
                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        🇬🇧 English
                    </button>
                </div>
            </div>
        </section>

        <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                <ShieldCheck size={16} className="text-brand-500" />
                {t('profile_security')}
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] shadow-xl shadow-brand-500/5">
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t('profile_new_password')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                    <Key size={18} />
                                </div>
                                <input 
                                    id="password" 
                                    type="password" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t('profile_confirm_password')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                    <Key size={18} />
                                </div>
                                <input 
                                    id="confirmPassword" 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={e => setConfirmPassword(e.target.value)} 
                                    required 
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all" 
                                />
                            </div>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loadingPassword} 
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98] uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                        {loadingPassword ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                        {t('profile_update_password')}
                    </button>
                </form>
            </div>
        </section>

        <AnimatePresence>
            {(error || message) && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
                        error ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    }`}
                >
                    {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    {error || message}
                </motion.div>
            )}
        </AnimatePresence>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50 flex justify-center">
            <button 
                onClick={onLogout} 
                className="flex items-center gap-2 px-8 py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
                <LogOut size={18} strokeWidth={3} />
                {t('profile_logout')}
            </button>
        </div>
    </div>
  );
};

export default ProfileView;
