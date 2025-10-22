import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE PER VERCEL (PRODUZIONE) ---
// In questo ambiente, le chiavi vengono lette in modo sicuro
// dalle "Environment Variables" che hai impostato nel pannello di Vercel.
// Questo è il metodo corretto per le applicazioni pubblicate online.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Se le variabili d'ambiente non sono state impostate su Vercel,
// l'applicazione si bloccherà con questo errore, rendendo facile capire il problema.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
