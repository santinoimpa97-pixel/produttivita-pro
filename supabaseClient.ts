import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE PER L'AMBIENTE DI SVILUPPO (AI Studio) ---
// Per far funzionare l'app qui, le chiavi devono essere inserite direttamente.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://htxjdnruwacrqkojpmgt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eGpkbnJ1d2FjcnFrb2pwbWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjUwMjUsImV4cCI6MjA4ODQwMTAyNX0.jF58jjt6MTo7l4-yCOeUMq-bLTbbx5i759h2bn4YiPI';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("Supabase environment variables are missing. Using default (possibly outdated) configuration.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
