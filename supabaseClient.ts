import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE PER AI STUDIO (SVILUPPO LOCALE) ---
// Questa configurazione utilizza le chiavi direttamente nel codice per garantire
// il funzionamento all'interno dell'ambiente di anteprima di AI Studio.

const supabaseUrl = 'https://ystdeennihpqrlqtveey.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Le credenziali di Supabase (URL e Chiave Anon) sono necessarie.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
