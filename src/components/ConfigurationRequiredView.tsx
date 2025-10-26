import React from 'react';

interface ConfigurationRequiredViewProps {
    supabaseError: boolean;
    geminiError: boolean;
}

const ConfigurationRequiredView: React.FC<ConfigurationRequiredViewProps> = ({ supabaseError, geminiError }) => {
    return (
        <div className="bg-slate-100 dark:bg-[#020617] min-h-screen flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl font-bold text-violet-600 dark:text-violet-400 text-center">Configurazione Richiesta</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-4 text-lg text-center">
                    Benvenuto! Per avviare l'applicazione in locale, è necessario configurare le tue chiavi API.
                </p>
                <div className="text-left bg-slate-100 dark:bg-slate-800 p-6 rounded-lg mt-6 space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Come configurare:</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        1. Crea un file chiamato <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">.env.local</code> nella cartella principale del tuo progetto.
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        2. Aggiungi le seguenti righe al file, sostituendo i valori con le tue chiavi personali:
                    </p>
                    <div className="bg-slate-200 dark:bg-slate-700 p-4 rounded-md font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                        {supabaseError && `VITE_SUPABASE_URL="https://tuo-url.supabase.co"
VITE_SUPABASE_ANON_KEY="tua_chiave_anon"
`}
                        {geminiError && `VITE_API_KEY="tua_chiave_api_gemini"`}
                    </div>
                     <p className="text-sm text-slate-600 dark:text-slate-300">
                        3. Salva il file e riavvia il server di sviluppo (se era in esecuzione) per applicare le modifiche.
                    </p>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-6 text-xs text-center">
                    (Per il deployment su servizi come Vercel, imposta queste variabili nelle impostazioni "Environment Variables" del tuo progetto).
                </p>
            </div>
        </div>
    );
};

export default ConfigurationRequiredView;
