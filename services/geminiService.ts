import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../i18n";
import { Task, Routine, Appointment, Priority } from "../types";

// --- CONFIGURAZIONE API ---
const defaultApiKey = import.meta.env.VITE_GEMINI_API_KEY;

let aiInstance: any = null;

export const getEffectiveGeminiApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('gemini_custom_api_key');
    if (customKey && customKey.trim()) return customKey.trim();
  }
  return defaultApiKey || '';
};

export const setCustomGeminiApiKey = (newKey: string): void => {
  if (typeof window !== 'undefined') {
    if (newKey.trim()) {
      localStorage.setItem('gemini_custom_api_key', newKey.trim());
    } else {
      localStorage.removeItem('gemini_custom_api_key');
    }
  }
  aiInstance = null; // invalidate cached instance
};

export const validateGeminiApiKey = async (testKey: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    const keyToTest = testKey.trim();
    if (!keyToTest) {
      return { valid: false, error: "La chiave API non può essere vuota." };
    }
    const testAi = new GoogleGenAI({ apiKey: keyToTest });
    const res = await testAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Rispondi solo con: OK",
    });
    if (res && res.text) {
      return { valid: true };
    }
    return { valid: false, error: "Nessuna risposta dal servizio Gemini." };
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes('CONSUMER_SUSPENDED') || msg.includes('suspended')) {
      return { valid: false, error: "Chiave sospesa da Google Cloud (CONSUMER_SUSPENDED)." };
    }
    if (msg.includes('API_KEY_INVALID') || msg.includes('400')) {
      return { valid: false, error: "Chiave API non valida o errata." };
    }
    return { valid: false, error: msg };
  }
};

const getAi = () => {
    const key = getEffectiveGeminiApiKey();
    if (!key) {
        throw new Error("La chiave API di Gemini è mancante.");
    }
    if (!aiInstance) {
        aiInstance = new GoogleGenAI({ apiKey: key });
    }
    return aiInstance;
};

export interface DayPlanItem {
  time: string;
  activity: string;
  category: 'focus' | 'routine' | 'appointment' | 'break';
}

/**
 * Generates a motivational quote using the Gemini API.
 */
export const generateMotivationalQuote = async (language: Language = 'it'): Promise<string> => {
    try {
        const langInstruction = language === 'en'
            ? `Generate a fresh, unique, concise and deeply inspiring motivational quote suitable for a high-performance productivity app. Variety seed: ${new Date().toISOString()}. The quote must be strictly in English.`
            : `Genera una frase motivazionale sempre fresca, unica, concisa e profondamente ispirante, perfetta per un'app di alta produttività. Seme varietà: ${new Date().toISOString()}. La frase deve essere rigorosamente in italiano.`;

        const response = await getAi().models.generateContent({
            model: "gemini-2.5-flash",
            contents: langInstruction + " Provide the response in JSON format with a single key 'quote'.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quote: {
                            type: Type.STRING,
                            description: 'The motivational quote.'
                        }
                    },
                    required: ['quote']
                },
            },
        });

        const jsonStr = response.text?.trim();
        if (!jsonStr) {
            return language === 'en' 
                ? "Discipline is the bridge between goals and accomplishment." 
                : "La disciplina è il ponte tra gli obiettivi e la realizzazione.";
        }
        
        const result: { quote: string } = JSON.parse(jsonStr);

        if (result && typeof result.quote === 'string' && result.quote.trim() !== '') {
            return result.quote.trim();
        }

        return language === 'en' 
            ? "Small daily improvements over time lead to stunning results." 
            : "I piccoli miglioramenti quotidiani portano a risultati straordinari.";

    } catch (error) {
        console.error("Errore generazione frase motivazionale:", error);
        return language === 'en' 
            ? "Focus on what matters most today." 
            : "Concentrati su ciò che conta davvero oggi.";
    }
};

/**
 * Generates a list of subtasks for a given main task using the Gemini API.
 */
export const generateSubtasksFromGemini = async (taskText: string, language: Language = 'it'): Promise<string[]> => {
  try {
    const prompt = language === 'en'
        ? `Given the main task "${taskText}", break it down into 3-5 clear, actionable, bite-sized sub-tasks. Provide the response in JSON format with an array of strings called "subtasks".`
        : `Dato il task principale "${taskText}", suddividilo in 3-5 sotto-task chiari, azionabili e concisi. Fornisci la risposta in formato JSON con un array di stringhe chiamato "subtasks".`;

    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: 'A single sub-task.'
              },
              description: 'List of generated sub-tasks.'
            }
          },
          required: ['subtasks']
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) return [];
    
    const result: { subtasks: string[] } = JSON.parse(jsonStr);

    if (result && Array.isArray(result.subtasks)) {
      return result.subtasks.filter(s => typeof s === 'string' && s.trim() !== '');
    }

    return [];

  } catch (error) {
    console.error("Errore generazione sotto-task:", error);
    return [];
  }
};

/**
 * Generates a list of tasks for a given routine name using the Gemini API.
 */
export const generateRoutineTasks = async (routineName: string, language: Language = 'it'): Promise<string[]> => {
  try {
    const prompt = language === 'en'
        ? `Given a daily routine called "${routineName}", suggest 3 to 6 practical habit tasks for this routine. Provide the response in JSON format with an array of strings called "tasks".`
        : `Data una routine quotidiana chiamata "${routineName}", suggerisci da 3 a 6 compiti pratici e abitudini sane per questa routine. Fornisci la risposta in formato JSON con un array di stringhe chiamato "tasks".`;

    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: 'A single routine task.'
              },
              description: 'List of generated tasks for the routine.'
            }
          },
          required: ['tasks']
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) return [];
    
    const result: { tasks: string[] } = JSON.parse(jsonStr);

    if (result && Array.isArray(result.tasks)) {
      return result.tasks.filter(t => typeof t === 'string' && t.trim() !== '');
    }

    return [];

  } catch (error) {
    console.error("Errore generazione compiti routine:", error);
    return [];
  }
};

/**
 * AI Smart Day Planner:
 * Analyzes today's tasks, routines, and appointments and builds a time-blocked timeline for the day.
 */
export const planMyDayWithGemini = async (
  tasks: Task[],
  routines: Routine[],
  appointments: Appointment[],
  language: Language = 'it'
): Promise<DayPlanItem[]> => {
  try {
    const taskNames = tasks.filter(t => !t.completed).map(t => `${t.text} (Priorità: ${t.priority})`).join(', ') || 'Nessun task specifico';
    const routineNames = routines.map(r => r.name).join(', ') || 'Nessuna routine specifica';
    const apptNames = appointments.map(a => `${a.time} - ${a.text}`).join(', ') || 'Nessun appuntamento fisso';

    const prompt = language === 'en'
      ? `You are an elite productivity strategist. Given the user's workload for today:
- Incomplete Tasks: ${taskNames}
- Routines: ${routineNames}
- Fixed Appointments: ${apptNames}

Build an optimal, realistic, time-blocked daily schedule starting from 08:30 to 19:30.
Output valid JSON containing an array "plan" with items having:
- "time": string (e.g. "09:00 - 10:30")
- "activity": string (e.g. "Deep Work on High Priority Task: ...")
- "category": string ("focus" | "routine" | "appointment" | "break")`
      : `Sei uno stratega di produttività personale d'élite. Considerato il carico di lavoro di oggi:
- Attività da fare: ${taskNames}
- Routine: ${routineNames}
- Appuntamenti con orario fisso: ${apptNames}

Costruisci una pianificazione oraria a blocchi (Time-Blocking) ottimale e realistica dalle 08:30 alle 19:30.
Fornisci un JSON valido con una chiave "plan" contenente una lista di oggetti con:
- "time": stringa (es. "09:00 - 10:30")
- "activity": stringa (es. "Focus Session: completare...")
- "category": stringa ("focus" | "routine" | "appointment" | "break")`;

    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['focus', 'routine', 'appointment', 'break'] }
                },
                required: ['time', 'activity', 'category']
              }
            }
          },
          required: ['plan']
        }
      }
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) return [];

    const result = JSON.parse(jsonStr);
    return Array.isArray(result.plan) ? result.plan : [];

  } catch (error) {
    console.error("Errore pianificazione giornata IA:", error);
    return [];
  }
};

export interface AIAction {
  type: 'create_task' | 'create_appointment' | 'create_note' | 'create_goal';
  payload: any;
}

/**
 * Chats with the personal assistant, passing profile context and supporting action execution.
 */
export const chatWithAssistant = async (
    userMessage: string,
    history: { role: 'user' | 'model', content: string }[],
    profile: { bio: string; strengths: string; weaknesses: string; rules: string },
    language: Language = 'it'
): Promise<{ text: string; action?: AIAction }> => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        const systemPrompt = language === 'en'
            ? `You are the user's personal elite productivity coach and strategic assistant.
You know the following about the user:
- Bio & Context: ${profile.bio || 'Not specified'}
- Strengths: ${profile.strengths || 'Not specified'}
- Weaknesses & Obstacles: ${profile.weaknesses || 'Not specified'}
- Rules & Tone of voice: ${profile.rules || 'Be motivating, concise, empathetic and actionable.'}
- Current Date: ${todayStr}

CRITICAL STYLE & LENGTH RULES:
- Keep your answers VERY CONCISE, sharp and direct (maximum 2 to 4 sentences or 3 bullet points).
- NEVER produce long walls of text or lengthy preambles. The user wants a clean, compact and punchy chat interface.

Capabilities:
You can directly execute actions when the user asks you to create or schedule something!
If the user asks you to add or create an item, include at the very end of your response a special block:
\`\`\`action
{"type":"create_task","payload":{"text":"...","priority":"Alta"|"Media"|"Bassa","dueDate":"YYYY-MM-DD"|null}}
\`\`\`
Or for appointments:
\`\`\`action
{"type":"create_appointment","payload":{"text":"...","date":"YYYY-MM-DD","time":"HH:MM"}}
\`\`\`
Or for notes:
\`\`\`action
{"type":"create_note","payload":{"title":"...","content":"..."}}
\`\`\`
Or for goals:
\`\`\`action
{"type":"create_goal","payload":{"title":"...","description":"...","targetDate":"YYYY-MM-DD"|null}}
\`\`\`

Always respond with encouraging, clean, compact markdown!`
            : `Sei il coach di produttività personale d'élite e assistente strategico dell'utente.
Informazioni sull'utente:
- Profilo & Contesto: ${profile.bio || 'Non specificata'}
- Punti di forza: ${profile.strengths || 'Non specificati'}
- Debolezze & Ostacoli: ${profile.weaknesses || 'Non specificate'}
- Regole e Tono di voce: ${profile.rules || 'Sii motivante, conciso, empatico e orientato all\'azione.'}
- Data odierna: ${todayStr}

REGOLE CRITICHE DI STILE E LUNGHEZZA:
- Sii SEMPRE ESTREMAMENTE CONCISO, diretto e compatto (massimo da 2 a 4 frasi brevi, oppure massimo 3 sintetici punti elenco).
- EVITA TASSATIVAMENTE muri di testo o spiegazioni prolisse. L'utente desidera una chat pulita, visivamente leggera e immediata.

Capacità di esecuzione diretta:
Puoi eseguire azioni direttamente nell'app quando l'utente ti chiede di creare, pianificare o appuntare qualcosa!
Se l'utente ti chiede di aggiungere un compito, un appuntamento, una nota o un obiettivo, inserisci in fondo al tuo messaggio il blocco:
\`\`\`action
{"type":"create_task","payload":{"text":"...","priority":"Alta"|"Media"|"Bassa","dueDate":"YYYY-MM-DD"|null}}
\`\`\`
Oppure per gli appuntamenti:
\`\`\`action
{"type":"create_appointment","payload":{"text":"...","date":"YYYY-MM-DD","time":"HH:MM"}}
\`\`\`
Oppure per le note:
\`\`\`action
{"type":"create_note","payload":{"title":"...","content":"..."}}
\`\`\`
Oppure per gli obiettivi:
\`\`\`action
{"type":"create_goal","payload":{"title":"...","description":"...","targetDate":"YYYY-MM-DD"|null}}
\`\`\`

Rispondi sempre con markdown curato, breve, compatto e motivante confermando l'azione!`;

        const contents: { role: string; parts: { text: string }[] }[] = [];

        const recentHistory = history.slice(-10);
        for (const msg of recentHistory) {
            contents.push({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        }

        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const response = await getAi().models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemPrompt,
            }
        });
        
        let replyText = response.text || (language === 'en' 
            ? "I'm sorry, I couldn't process that. Let's try again!" 
            : "Mi dispiace, non sono riuscito a elaborare la risposta. Riprova!");

        // Parse action if present
        let extractedAction: AIAction | undefined = undefined;
        const actionMatch = replyText.match(/```action\s*([\s\S]*?)\s*```/);
        if (actionMatch && actionMatch[1]) {
          try {
            extractedAction = JSON.parse(actionMatch[1]);
            // Remove the raw json block from user-facing text
            replyText = replyText.replace(/```action[\s\S]*?```/, '').trim();
          } catch (e) {
            console.warn("Failed to parse action json:", e);
          }
        }

        return { text: replyText, action: extractedAction };

    } catch (error: any) {
        console.error("Errore chat assistente:", error);
        const errMsg = error?.message || String(error);
        if (errMsg.includes('CONSUMER_SUSPENDED') || errMsg.includes('suspended')) {
          return {
            text: language === 'en'
              ? "⚠️ **Gemini API Key Suspended:** Google has suspended this API key (`CONSUMER_SUSPENDED`). Please go to **Profile > Gemini AI Key** to insert a new free key from Google AI Studio (aistudio.google.com)."
              : "⚠️ **Chiave API Gemini Sospesa:** La chiave API attuale è stata sospesa da Google (`CONSUMER_SUSPENDED`). Vai su **Profilo > Chiave API Gemini** per inserire una nuova chiave gratuita da Google AI Studio (aistudio.google.com)."
          };
        }
        return { 
          text: language === 'en'
            ? "⚠️ Could not connect to the AI service. Please check your internet connection or API settings."
            : "⚠️ Impossibile connettersi al servizio IA. Verifica la connessione internet o la configurazione dell'app."
        };
    }
};
