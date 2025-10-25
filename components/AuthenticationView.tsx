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
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { display_name: displayName } },
            });
            if (error) {
                setError(error.message);
            } else {
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
            redirectTo: window.location.origin,
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Se l\'email è corretta, riceverai un link per il recupero della password.');
        }
        setLoading(false);
    }

    const renderForm = () => {
        if (mode === 'forgotPassword') {
            return (
                <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <div className="mt-1 relative">
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-4 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-violet-500 focus:border-violet-500" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50">
                        {loading ? 'Invio...' : 'Invia Link di Recupero'}
                    </button>
                </form>
            );
        }

        return (
            <form onSubmit={handleAuth} className="space-y-6">
                {mode === 'register' && (
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Visualizzato</label>
                        <div className="mt-1 relative">
                            <UserIcon className="absolute inset-y-0 left-3 h-full w-5 text-slate-400" />
                            <input id="displayName" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-violet-500 focus:border-violet-500" />
                        </div>
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <div className="mt-1 relative">
                        <svg className="absolute inset-y-0 left-3 h-full w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-violet-500 focus:border-violet-500" />
                    </div>
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <div className="mt-1 relative">
                        <KeyIcon className="absolute inset-y-0 left-3 h-full w-5 text-slate-400" />
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-violet-500 focus:border-violet-500" />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50">
                    {loading ? 'Caricamento...' : (mode === 'login' ? 'Accedi' : 'Registrati')}
                </button>
            </form>
        );
    };

    const titles = {
        login: { title: 'Bentornato!', subtitle: 'Accedi al tuo account' },
        register: { title: 'Crea un Account', subtitle: 'Inizia il tuo percorso di produttività' },
        forgotPassword: { title: 'Recupera Password', subtitle: 'Inserisci la tua email per ricevere le istruzioni' },
    };

    const toggleText = {
        login: { question: "Non hai un account?", action: "Registrati" },
        register: { question: "Hai già un account?", action: "Accedi" },
        forgotPassword: { question: "Ricordi la password?", action: "Torna al Login" },
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#020617] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{titles[mode].title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">{titles[mode].subtitle}</p>
                </div>
                {renderForm()}
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                {message && <p className="text-sm text-green-600 text-center">{message}</p>}
                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                    {toggleText[mode].question}
                    <button onClick={() => setMode(mode === 'register' ? 'login' : mode === 'login' ? 'register' : 'login')} className="font-medium text-violet-600 dark:text-violet-400 hover:underline ml-1">
                        {toggleText[mode].action}
                    </button>
                    {mode === 'login' && <button onClick={() => setMode('forgotPassword')} className="font-medium text-violet-600 dark:text-violet-400 hover:underline ml-2">Password dimenticata?</button>}
                </p>
            </div>
        </div>
    );
};
export default AuthenticationView;
