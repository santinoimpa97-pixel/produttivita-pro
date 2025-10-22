import { createClient } from '@supabase/supabase-js';

// Per far funzionare l'app all'interno di AI Studio, le chiavi di Supabase
// devono essere inserite direttamente qui.
// Quando pubblicherai l'app su un servizio come Vercel, è più sicuro 
// usare le "Environment Variables".
const supabaseUrl = 'https://ystdeennihpqrlqtveey.supabase.co';

// La chiave "anon" di Supabase. Assicurati che sia quella corretta per il tuo progetto.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8';

// Se l'URL o la chiave sono mancanti, la funzione createClient genererà un errore, 
// che è il comportamento corretto.
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("URL o chiave Supabase mancanti. Controlla il file supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
