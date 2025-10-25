import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Errore catturato dall'ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
