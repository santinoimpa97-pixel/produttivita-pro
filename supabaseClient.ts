import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE MANUALE OBBLIGATORIA ---
// INSERISCI QUI LE TUE CHIAVI API DI SUPABASE
// Le puoi trovare nella dashboard del tuo progetto Supabase in Settings > API.
const supabaseUrl = 'https://ystdeennihpqrlqtveey.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8';

export let SUPABASE_CONFIG_ERROR = false;

if (supabaseUrl.startsWith('INSERISCI_QUI') || supabaseAnonKey.startsWith('INSERISCI_QUI')) {
    SUPABASE_CONFIG_ERROR = true;
    console.error("CONFIGURAZIONE SUPABASE MANCANTE: Inserisci i tuoi dati reali nel file 'supabaseClient.ts'.");
}

// Inizializza il client solo se le chiavi sono state inserite, altrimenti esporta null.
// Questo previene errori di inizializzazione che bloccano l'app.
export const supabase = SUPABASE_CONFIG_ERROR ? null! : createClient(supabaseUrl, supabaseAnonKey);
