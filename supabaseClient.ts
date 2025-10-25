import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE DI DEBUG ---
// Le chiavi API sono state inserite direttamente nel codice come richiesto dall'utente
// per verificare la connettività e isolare il problema delle variabili d'ambiente su Vercel.
// ASSICURATI DI AVER SOSTITUITO I SEGNAPOSTO CON LE TUE CHIAVI REALI.
const supabaseUrl = 'https://ystdeennihpqrlqtveey.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8';

// Questo creerà il client Supabase. Se le chiavi sono errate, l'app si bloccherà
// e vedrai un errore specifico nella console del browser (es. un errore di rete o di autenticazione).
// Questo è il passo successivo per diagnosticare il problema.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// La variabile SUPABASE_CONFIG_ERROR è stata rimossa per forzare l'avvio.
export const SUPABASE_CONFIG_ERROR = null;
