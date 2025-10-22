import { createClient } from '@supabase/supabase-js';

// Ora le chiavi vengono prese in modo sicuro dalle variabili d'ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);