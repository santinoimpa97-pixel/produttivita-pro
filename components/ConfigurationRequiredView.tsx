import React from 'react';

interface ConfigurationRequiredViewProps {
    supabaseError: boolean;
    geminiError: boolean;
}

const ConfigurationRequiredView: React.FC<ConfigurationRequiredViewProps> = ({ supabaseError, geminiError }) => {
    return (
        <div className="bg-slate-100 dark:bg-[#020617] min-h-screen flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
                <h1 className="text-3xl font-bold text-violet-600 dark:text-violet-400">Configurazione Richiesta</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-4 text-lg">
                    Benvenuto! Per avviare l'applicazione, è necessario inserire le chiavi API.
                </p>
                <div className="text-left bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mt-6 space-y-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">Azioni richieste:</p>
                    
                    {supabaseError && (
                        <div>
                            <p className="text-slate-700 dark:text-slate-200">
                                1. Apri il file <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono">supabaseClient.ts</code>
                            </p>
                            <p className="text-slate-700 dark:text-slate-200 ml-4">
                                2. Sostituisci i segnaposto con la tua <strong>URL</strong> e la tua chiave <strong>'anon'</strong> di Supabase.
                            </p>
                        </div>
                    )}

                    {geminiError && (
                         <div>
                            <p className="text-slate-700 dark:text-slate-200">
                                1. Apri il file <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono">services/geminiService.ts</code>
                            </p>
                            <p className="text-slate-700 dark:text-slate-200 ml-4">
                                2. Sostituisci il segnaposto con la tua <strong>chiave API</strong> di Gemini.
                            </p>
                        </div>
                    )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-6 text-sm">
                    Una volta salvate le modifiche, ricarica la pagina. L'applicazione si avvierà correttamente.
                </p>
            </div>
        </div>
    );
};

export default ConfigurationRequiredView;
