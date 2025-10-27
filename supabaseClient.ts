import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE PER L'AMBIENTE DI SVILUPPO (AI Studio) ---
// Per far funzionare l'app qui, le chiavi devono essere inserite direttamente.

const supabaseUrl = 'https://ystdeennihpqrlqtveey.supabase.co';

// Chiave "anon" di Supabase.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
