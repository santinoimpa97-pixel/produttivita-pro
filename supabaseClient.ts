import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE MANUALE OBBLIGATORIA ---
// L'architettura di questo progetto richiede di inserire le chiavi API direttamente qui.
// Sostituisci i valori segnaposto qui sotto con le tue chiavi reali prese dalla dashboard di Supabase.
const supabaseUrl = 'https://ystdeennihpqrlqtveey.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8';

// Se le chiavi sopra non vengono sostituite, la libreria Supabase restituirà un errore nella console del browser.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
