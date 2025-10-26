import { createClient } from '@supabase/supabase-js';

// INIZIA LA CONFIGURAZIONE
// Per lo sviluppo locale, inserisci qui le tue chiavi Supabase.
// Per il deployment (es. Vercel), l'app userà automaticamente le variabili d'ambiente.
const SUPABASE_URL_PLACEHOLDER = "https://ystdeennihpqrlqtveey.supabase.co";
const SUPABASE_ANON_KEY_PLACEHOLDER = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8";
// FINE CONFIGURAZIONE

// Le chiavi API di Supabase vengono fornite prima dalle variabili d'ambiente,
// poi dai placeholder sopra, per flessibilità tra development e production.
const supabaseUrl = (typeof process !== 'undefined' && process.env.SUPABASE_URL) || SUPABASE_URL_PLACEHOLDER;
const supabaseAnonKey = (typeof process !== 'undefined' && process.env.SUPABASE_ANON_KEY) || SUPABASE_ANON_KEY_PLACEHOLDER;

export let SUPABASE_CONFIG_ERROR = false;

if (supabaseUrl.startsWith("INSERISCI_QUI") || supabaseAnonKey.startsWith("INSERISCI_QUI")) {
    SUPABASE_CONFIG_ERROR = true;
    console.error("CONFIGURAZIONE SUPABASE MANCANTE: Inserisci le tue chiavi in supabaseClient.ts o imposta le variabili d'ambiente SUPABASE_URL e SUPABASE_ANON_KEY.");
}

// Inizializza il client solo se le chiavi sono state inserite, altrimenti esporta null.
// Questo previene errori di inizializzazione che bloccano l'app.
export const supabase = SUPABASE_CONFIG_ERROR ? null! : createClient(supabaseUrl!, supabaseAnonKey!);