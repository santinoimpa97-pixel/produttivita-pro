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
                    Benvenuto! Per avviare l'applicazione, è necessario inserire le tue chiavi API.
                </p>
                <div className="text-left bg-slate-100 dark:bg-slate-800 p-6 rounded-lg mt-6 space-y-6">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-lg">Come configurare per lo sviluppo locale:</p>
                    
                    {supabaseError && (
                        <div>
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">1. Configurazione Supabase</h3>
                            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
                                Apri il file <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">supabaseClient.ts</code> e sostituisci i placeholder con le tue chiavi Supabase.
                            </p>
                        </div>
                    )}

                    {geminiError && (
                         <div>
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">{supabaseError ? '2.' : '1.'} Configurazione Gemini</h3>
                            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
                                Apri il file <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">services/geminiService.ts</code> e sostituisci il placeholder con la tua chiave API di Google AI Studio.
                            </p>
                        </div>
                    )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-6 text-sm text-center">
                    Puoi trovare queste chiavi nelle dashboard dei rispettivi servizi. Una volta inserite e salvati i file, la pagina dovrebbe ricaricarsi.
                </p>
                 <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs text-center">
                    (Per il deployment su servizi come Vercel, imposta le variabili d'ambiente per maggiore sicurezza).
                </p>
            </div>
        </div>
    );
};

export default ConfigurationRequiredView;