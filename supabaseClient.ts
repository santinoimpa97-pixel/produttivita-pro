import { createClient } from '@supabase/supabase-js';

// --- ATTENZIONE: CONFIGURAZIONE RICHIESTA PER VERCEL ---
// L'applicazione non può funzionare senza le chiavi API corrette per Supabase.
// Per favore, sostituisci i valori segnaposto qui sotto con le tue chiavi reali.
// Puoi trovarle nella dashboard del tuo progetto su Supabase, in "Project Settings" > "API".

const supabaseUrl = 'https://ystdeennihpqrlqtveey.supabase.co'; // Esempio: 'https://xxxxxxxxxx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8'; // Esempio: 'eyJhbGciOiJIUzI1NiIsIn...'

// Controllo per assicurarsi che le chiavi siano state cambiate.
if (!supabaseUrl.startsWith('https') || supabaseAnonKey.startsWith('INCOLLA_QUI')) {
    // Questo avviso apparirà nella console del browser se le chiavi non sono configurate.
    // L'app si caricherà, ma le funzionalità del database falliranno finché non verranno inserite le chiavi corrette.
    console.warn(
        "Le chiavi di Supabase non sono configurate. L'app si caricherà, ma le operazioni sul database falliranno. Modifica il file `supabaseClient.ts` con le tue chiavi reali."
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);