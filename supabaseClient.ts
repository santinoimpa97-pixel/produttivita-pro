import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE PER AI STUDIO (SVILUPPO LOCALE) ---
// Inserisci qui i tuoi dati di Supabase per far funzionare l'app in AI Studio.
// Per la pubblicazione su Vercel, dovrai usare la versione di questo file
// che legge le chiavi dalle "Environment Variables" (VITE_...).

const supabaseUrl = 'https://ystdeennihpqrlqtveey.supabase.co';
const supabaseAnonKey = 'INSERISCI_LA_TUA_CHIAVE_ANOeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8N_DI_SUPABASE_QUI';

// Questo controllo mostra un errore chiaro nell'interfaccia utente se la chiave non è stata inserita.
if (supabaseAnonKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8')) {
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 2rem; text-align: center; font-family: sans-serif; color: #dc2626; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; margin: 1rem;">
      <h1 style="font-size: 1.5rem; font-weight: bold;">Errore di Configurazione</h1>
      <p style="margin-top: 0.5rem;">Chiave Supabase mancante! Apri il file <strong>supabaseClient.ts</strong> e sostituisci il testo segnaposto con la tua vera 'anon key' di Supabase.</p>
    </div>
  `;
  throw new Error("Chiave Supabase mancante! Apri il file 'supabaseClient.ts' e sostituisci il testo segnaposto con la tua vera 'anon key' di Supabase.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);