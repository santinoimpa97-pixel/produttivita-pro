import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '../types';
import { KeyIcon } from './icons/KeyIcon';
import { UserIcon } from './icons/UserIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface UserProfileViewProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (displayName: string) => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onLogout, onUpdateUser }) => {
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
    setLoadingProfile(false);
    if (error) return setError(error.message);
    if (data.user?.user_metadata.display_name) {
      onUpdateUser(data.user.user_metadata.display_name);
      setMessage("Profilo aggiornato con successo!");
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if(password !== confirmPassword) return setError("Le password non coincidono.");
      if(password.length < 6) return setError("La password deve essere di almeno 6 caratteri.");

      setLoadingPassword(true);
      setError(null);
      setMessage(null);
      const { error } = await supabase.auth.updateUser({ password });
      setLoadingPassword(false);
      if (error) return setError(error.message);
      setMessage("Password aggiornata con successo!");
      setPassword('');
      setConfirmPassword('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Informazioni Profilo</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Visualizzato</label>
                    <div className="mt-1 relative">
                        <UserIcon className="absolute inset-y-0 left-3 h-full w-5 text-slate-400" />
                        <input id="displayName" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-violet-500 focus:border-violet-500" />
                    </div>
                </div>
                <button type="submit" disabled={loadingProfile} className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50">
                    {loadingProfile ? 'Salvataggio...' : 'Salva Profilo'}
                </button>
            </form>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Cambia Password</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nuova Password</label>
                    <div className="mt-1 relative">
                        <KeyIcon className="absolute inset-y-0 left-3 h-full w-5 text-slate-400" />
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-violet-500 focus:border-violet-500" />
                    </div>
                </div>
                <div>
                    <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Conferma Nuova Password</label>
                    <div className="mt-1 relative">
                        <KeyIcon className="absolute inset-y-0 left-3 h-full w-5 text-slate-400" />
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-violet-500 focus:border-violet-500" />
                    </div>
                </div>
                <button type="submit" disabled={loadingPassword} className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50">
                    {loadingPassword ? 'Aggiornamento...' : 'Aggiorna Password'}
                </button>
            </form>
        </div>

        {(error || message) && <p className={`mt-4 text-center text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>{error || message}</p>}

        <div className="text-center">
            <button onClick={onLogout} className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">
                <LogoutIcon className="w-5 h-5"/>
                Logout
            </button>
        </div>
    </div>
  );
};
export default UserProfileView;
