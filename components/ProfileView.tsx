import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Key, LogOut, Save, Globe, Loader2, CheckCircle2, Download, Sparkles, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { User } from '../types';
import { Language } from '../i18n';
import { useLanguage } from '../LanguageContext';
import { getEffectiveGeminiApiKey, setCustomGeminiApiKey, validateGeminiApiKey } from '../services/geminiService';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (displayName: string) => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
  onExportData?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, onUpdateUser, language, onSetLanguage, onExportData }) => {
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gemini API Key state
  const [customKey, setCustomKey] = useState(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('gemini_custom_api_key') || '') : '';
  });
  const [keyInput, setKeyInput] = useState('');
  const [keyTesting, setKeyTesting] = useState(false);
  const [keyMessage, setKeyMessage] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  const handleSaveGeminiKey = async () => {
    if (!keyInput.trim()) {
      setKeyError(language === 'en' ? 'Please enter a valid key.' : 'Inserisci una chiave valida.');
      return;
    }
    setKeyTesting(true);
    setKeyError(null);
    setKeyMessage(null);
    
    const result = await validateGeminiApiKey(keyInput);
    setKeyTesting(false);
    
    if (result.valid) {
      setCustomGeminiApiKey(keyInput.trim());
      setCustomKey(keyInput.trim());
      setKeyInput('');
      setKeyMessage(language === 'en' ? '✅ Gemini API key validated and activated!' : '✅ Chiave API Gemini convalidata e attivata con successo!');
      setTimeout(() => setKeyMessage(null), 4000);
    } else {
      setKeyError(result.error || (language === 'en' ? 'Key validation failed.' : 'Verifica della chiave fallita.'));
    }
  };

  const handleRemoveCustomKey = () => {
    setCustomGeminiApiKey('');
    setCustomKey('');
    setKeyInput('');
    setKeyMessage(language === 'en' ? 'Custom key removed.' : 'Chiave personalizzata rimossa.');
    setTimeout(() => setKeyMessage(null), 3000);
  };

  // Sync displayName when user prop changes
  useEffect(() => {
    setDisplayName(user.displayName || '');
  }, [user.displayName]);

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
      setTimeout(() => setMessage(null), 3000);
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
      setTimeout(() => setMessage(null), 3000);
    }
    setLoadingPassword(false);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <UserIcon className="text-brand-600" size={26} />
          {t('profile_title')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          {t('profile_subtitle')}
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs font-bold">
          {error}
        </div>
      )}

      {/* User Info & Display Name Card */}
      <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 font-black text-2xl">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon size={28} />}
          </div>
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {user.displayName || 'Utente'}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Mail size={13} />
              {user.email}
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="displayName" className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
              {t('profile_display_name')}
            </label>
            <input 
              id="displayName" 
              type="text" 
              value={displayName} 
              onChange={e => setDisplayName(e.target.value)} 
              required 
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all text-sm" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loadingProfile} 
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all uppercase tracking-wider text-xs disabled:opacity-50"
          >
            {loadingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {t('profile_save')}
          </button>
        </form>
      </div>

      {/* Language Preference Card */}
      <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {t('profile_language')}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {t('profile_language_subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => onSetLanguage('it')}
            className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all text-left flex items-center justify-between ${
              language === 'it'
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div>
              <div>Italiano</div>
              <div className="text-[10px] text-slate-400 font-medium">Lingua predefinita</div>
            </div>
            {language === 'it' && <CheckCircle2 size={18} className="text-brand-600" />}
          </button>

          <button
            type="button"
            onClick={() => onSetLanguage('en')}
            className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all text-left flex items-center justify-between ${
              language === 'en'
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div>
              <div>English</div>
              <div className="text-[10px] text-slate-400 font-medium">US & International</div>
            </div>
            {language === 'en' && <CheckCircle2 size={18} className="text-brand-600" />}
          </button>
        </div>
      </div>

      {/* Gemini AI Key Configuration Card */}
      <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] space-y-4 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {language === 'en' ? 'Google Gemini AI Key' : 'Chiave API Google Gemini'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'en' 
                  ? 'Configure or update your personal API key for AI features' 
                  : 'Configura o aggiorna la tua chiave API per l\'assistente, il pianificatore e i task'}
              </p>
            </div>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 self-start sm:self-center"
          >
            <span>Google AI Studio</span>
            <ExternalLink size={13} />
          </a>
        </div>

        <div className="space-y-3 pt-1">
          {customKey ? (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                  {language === 'en' ? 'Active custom key: ' : 'Chiave personalizzata attiva: '}
                  {customKey.slice(0, 8)}••••••••{customKey.slice(-4)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCustomKey}
                className="text-xs font-bold text-red-500 hover:underline ml-2 shrink-0"
              >
                {language === 'en' ? 'Remove' : 'Rimuovi'}
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span>
                {language === 'en'
                  ? 'The default API key in .env has been suspended by Google. Generate a free key on Google AI Studio and paste it below.'
                  : 'La chiave API predefinita è stata sospesa da Google. Crea una chiave gratuita su Google AI Studio e incollala qui sotto per riattivare le funzioni IA.'}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Incolla qui la chiave API (es. AIzaSy...)"
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={handleSaveGeminiKey}
              disabled={keyTesting || !keyInput.trim()}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all text-xs uppercase tracking-wider disabled:opacity-50 shrink-0 shadow-md shadow-indigo-500/20 active:scale-95"
            >
              {keyTesting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{keyTesting ? (language === 'en' ? 'Testing...' : 'Verifica...') : (language === 'en' ? 'Validate & Save' : 'Valida & Salva')}</span>
            </button>
          </div>

          {keyMessage && (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
              {keyMessage}
            </p>
          )}
          {keyError && (
            <p className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200 dark:border-red-900/40">
              {keyError}
            </p>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
            <Key size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {t('profile_security')}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {t('profile_update_password')}
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
              {t('profile_new_password')}
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all text-sm" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">
              {t('profile_confirm_password')}
            </label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              placeholder="••••••••"
              required 
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none transition-all text-sm" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loadingPassword} 
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:opacity-90 transition-all uppercase tracking-wider text-xs disabled:opacity-50"
          >
            {loadingPassword ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
            {t('profile_update_password')}
          </button>
        </form>
      </div>

      {/* Data & Backup Card */}
      <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Download size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {language === 'en' ? 'Data & Backup' : 'Dati & Backup'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'en' ? 'Export all your tasks, notes, routines and goals in JSON format' : 'Scarica un archivio JSON con tutte le tue attività, note e routine'}
              </p>
            </div>
          </div>
          {onExportData && (
            <button
              type="button"
              onClick={onExportData}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all uppercase tracking-wider text-xs shadow-md shadow-brand-500/20 active:scale-95 shrink-0 self-start sm:self-center"
            >
              <Download size={16} />
              <span>{language === 'en' ? 'Download Backup' : 'Scarica Backup'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-6 py-3 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-colors text-xs uppercase tracking-wider"
        >
          <LogOut size={16} />
          {t('profile_logout')}
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
