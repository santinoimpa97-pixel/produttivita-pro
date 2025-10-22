import { createClient } from '@supabase/supabase-js';

// Per far funzionare l'app all'interno di AI Studio, le chiavi di Supabase
// devono essere inserite direttamente qui.
// Quando pubblicherai l'app su un servizio come Vercel, è più sicuro 
// usare le "Environment Variables".
const supabaseUrl = 'https://ystdeennihpqrlqtveey.supabase.co';

// !!! AZIONE RICHIESTA !!!
// Sostituisci la stringa qui sotto con la tua vera "anon key" di Supabase.
// La puoi trovare nelle impostazioni API del tuo progetto su supabase.com.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8';

// Questo controllo verifica se la chiave è ancora quella di default.
if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8') {
    const errorMessage = "Chiave Supabase mancante! Apri il file 'supabaseClient.ts' e sostituisci il testo segnaposto con la tua vera 'anon key' di Supabase.";
    
    // Mostra un errore visibile nell'interfaccia utente per guidare l'utente
    // senza bloccare completamente l'app.
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `<div style="padding: 2rem; text-align: center; background-color: #fee2e2; border: 1px solid #ef4444; margin: 2rem; border-radius: 0.5rem; color: #b91c1c;">
            <h2 style="font-size: 1.25rem; font-weight: bold;">Configurazione Incompleta</h2>
            <p style="margin-top: 0.5rem;">${errorMessage}</p>
        </div>`;
    }
    // Non lanciamo un errore per non bloccare l'app, ma la connessione a Supabase non funzionerà.
    console.error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);