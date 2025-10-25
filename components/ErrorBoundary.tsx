import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Errore catturato dall'ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || '';
      // Controlla i messaggi di errore tipici per le chiavi API mancanti o non valide
      const isConfigError = 
        errorMessage.includes('Invalid supabaseUrl') || 
        errorMessage.includes('supabaseUrl is required') ||
        errorMessage.includes('apiKey');

      if (isConfigError) {
        return (
          <div className="bg-slate-100 dark:bg-[#020617] min-h-screen flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
              <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Configurazione Richiesta</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-4 text-lg">
                L'applicazione non può avviarsi perché le chiavi API non sono state impostate.
              </p>
              <div className="text-left bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mt-6 space-y-4">
                <p className="font-semibold text-slate-800 dark:text-slate-100">Azione richiesta:</p>
                <div>
                  <p className="text-slate-700 dark:text-slate-200">1. Apri il file <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono">supabaseClient.ts</code></p>
                  <p className="text-slate-700 dark:text-slate-200 ml-4">2. Sostituisci i segnaposto con la tua URL e la tua chiave 'anon' di Supabase.</p>
                </div>
                <div>
                  <p className="text-slate-700 dark:text-slate-200">1. Apri il file <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono">services/geminiService.ts</code></p>
                  <p className="text-slate-700 dark:text-slate-200 ml-4">2. Sostituisci il segnaposto con la tua chiave API di Gemini.</p>
                </div>
              </div>
               <p className="text-slate-500 dark:text-slate-400 mt-6 text-sm">
                Una volta salvate le modifiche, ricarica la pagina. L'applicazione si avvierà correttamente.
              </p>
            </div>
          </div>
        );
      }

      // Fallback per altri tipi di errori
      return (
         <div className="bg-slate-100 dark:bg-[#020617] min-h-screen flex items-center justify-center p-4 font-sans">
             <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Qualcosa è andato storto</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Si è verificato un errore inaspettato. Prova a ricaricare la pagina.</p>
             </div>
         </div>
      );
    }

    return this.props.children;
  }
}