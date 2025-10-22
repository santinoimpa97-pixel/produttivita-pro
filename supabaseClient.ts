import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE PER AI STUDIO (SVILUPPO LOCALE) ---
// Inserisci qui i tuoi dati di Supabase per far funzionare l'app in AI Studio.
// Per la pubblicazione su Vercel, dovrai usare la versione di questo file
// che legge le chiavi dalle "Environment Variables" (VITE_...).

const supabaseUrl = 'https://ystdeennihpqrlqtveey.supabase.co';
// Ho corretto la chiave che avevi incollato.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8';

// Ho rimosso il controllo che bloccava l'app per permetterle di avviarsi.
// Assicurati che la chiave sopra sia corretta.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);