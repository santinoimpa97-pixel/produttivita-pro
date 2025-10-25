
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { UserIcon } from './icons/UserIcon';
import { KeyIcon } from './icons/KeyIcon';

type AuthMode = 'login' | 'register' | 'forgotPassword';

const AuthenticationView: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
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
                setMessage('Registrazione completata! Controlla la tua email per la verifica.');
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
            redirectTo: window.location.origin, // O una pagina specifica per il reset
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Se l\'email è corretta, riceverai un link per il recupero della password.');
        }
        setLoading(false);
    }

    const renderContent = () => {
        if (mode === 'forgotPassword') {
            return (
                <>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Recupera Password</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Inserisci la tua email per ricevere le istruzioni.</p>
                    </div>
                     <form onSubmit={handlePasswordReset} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                                </div>
                                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-violet-500 focus:border-violet-500 transition" />
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        {message && <p className="text-sm text-green-600 text-center">{message}</p>}
                        <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-colors">
                            {loading ? 'Invio...' : 'Invia Link di Recupero'}
                        </button>
                    </form>
                     <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                        Ricordi la password?
                        <button onClick={() => { setMode('login'); setError(null); setMessage(null); }} className="font-medium text-violet-600 dark:text-violet-400 hover:underline ml-1">
                            Torna al Login
                        </button>
                    </p>
                </>
            );
        }

        return (
            <>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Produttività Pro</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">{mode === 'login' ? 'Accedi al tuo account' : 'Crea un nuovo account'}</p>
                </div>
                
                <form onSubmit={handleAuth} className="space-y-6">
                    {mode === 'register' && (
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Visualizzato</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input id="displayName" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-violet-500 focus:border-violet-500 transition" />
                            </div>
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                         <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                            </div>
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-violet-500 focus:border-violet-500 transition" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-violet-500 focus:border-violet-500 transition" />
                        </div>
                    </div>
                    
                    {mode === 'login' && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-slate-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">Ricordami</label>
                            </div>
                            <div className="text-sm">
                                <button type="button" onClick={() => setMode('forgotPassword')} className="font-medium text-violet-600 dark:text-violet-400 hover:underline">
                                    Password dimenticata?
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    {message && <p className="text-sm text-green-600 text-center">{message}</p>}

                    <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-colors">
                        {loading ? 'Caricamento...' : (mode === 'login' ? 'Accedi' : 'Registrati')}
                    </button>
                </form>

                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                    {mode === 'login' ? "Non hai un account?" : "Hai già un account?"}
                    <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setMessage(null); }} className="font-medium text-violet-600 dark:text-violet-400 hover:underline ml-1">
                        {mode === 'login' ? 'Registrati' : 'Accedi'}
                    </button>
                </p>
            </>
        )
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#020617] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 space-y-6">
               {renderContent()}
            </div>
        </div>
    );
};

export default AuthenticationView;
