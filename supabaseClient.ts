import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE PER AI STUDIO ---
// In questo ambiente, le chiavi sono scritte direttamente nel codice.
// Questo permette all'app di funzionare qui per lo sviluppo.
// Quando pubblicherai su Vercel, dovrai usare la versione di questo file
// che legge le chiavi da 'process.env'.

const supabaseUrl = 'https://ystdeennihpqrlqtveey.supabase.co';

// !!! IMPORTANTE !!!
// Assicurati che la chiave qui sotto sia la tua vera "chiave anonima" di Supabase.
// Se questa chiave non è corretta, l'applicazione non riuscirà a connettersi al database.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdGRlZW5uaWhwcXJscXR2ZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjExNzcsImV4cCI6MjA3NjYzNzE3N30.HP6dajQFlql3Uv1IWmio8jPsir34DEQT2amAfWgRKh8';

// Inizializza il client di Supabase.
// Se l'URL o la chiave non sono corretti, vedrai degli errori nella console del browser
// quando l'app proverà a interagire con il database.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
