import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// FIX: Removed explicit configuration check to simplify initialization.
// The app will now fail fast if environment variables are missing,
// which is a cleaner approach and relies on the ErrorBoundary for handling.
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
