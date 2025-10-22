import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE PER AI STUDIO (SVILUPPO) ---
// In questo ambiente, `import.meta.env` non esiste.
// Usiamo le chiavi direttamente nel codice per lo sviluppo.

const supabaseUrl = 'https://ystdeennihpqrlqtveey.supabase.co';

// ATTENZIONE: Inserisci qui la tua chiave "anon" di Supabase.
// La trovi nella dashboard del tuo progetto Supabase in Settings -> API.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8';

if (!supabaseUrl || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8') {
  // Questo messaggio ti aiuterà a ricordare di inserire la chiave.
  console.warn("Chiave Supabase mancante! Apri il file 'supabaseClient.ts' e inserisci la tua vera 'anon key' per far funzionare il database.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
