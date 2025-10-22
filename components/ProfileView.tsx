import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '../types';
import { KeyIcon } from './icons/KeyIcon';
import { UserIcon } from './icons/UserIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (displayName: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, onUpdateUser }) => {
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
      setMessage("Profilo aggiornato con successo!");
    }
    setLoadingProfile(false);
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if(password !== confirmPassword) {
          setError("Le password non coincidono.");
          return;
      }
      if(password.length < 6) {
          setError("La password deve essere di almeno 6 caratteri.");
          return;
      }

      setLoadingPassword(true);
      setError(null);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Password aggiornata con successo!");
        setPassword('');
        setConfirmPassword('');
      }
      setLoadingPassword(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Informazioni Profilo</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Aggiorna le tue informazioni personali.</p>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                 <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Visualizzato</label>
                    <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input id="displayName" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-violet-500 focus:border-violet-500" />
                    </div>
                </div>
                <button type="submit" disabled={loadingProfile} className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 disabled:bg-violet-400">
                    {loadingProfile ? 'Salvataggio...' : 'Salva Profilo'}
                </button>
            </form>
        </div>

         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Cambia Password</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Assicurati di usare una password sicura.</p>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nuova Password</label>
                    <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <KeyIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-violet-500 focus:border-violet-500" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Conferma Nuova Password</label>
                    <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <KeyIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-violet-500 focus:border-violet-500" />
                    </div>
                </div>
                <button type="submit" disabled={loadingPassword} className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 disabled:bg-violet-400">
                    {loadingPassword ? 'Aggiornamento...' : 'Aggiorna Password'}
                </button>
            </form>
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}

        <div className="text-center">
            <button onClick={onLogout} className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">
                <LogoutIcon className="w-5 h-5"/>
                Logout
            </button>
        </div>
    </div>
  );
};

export default ProfileView;