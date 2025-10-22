import { GoogleGenAI, Type } from "@google/genai";

// --- CONFIGURAZIONE PER AI STUDIO (SVILUPPO LOCALE) ---
// Per far funzionare le funzionalità di IA in AI Studio, devi inserire la tua chiave API qui.
// ATTENZIONE: Per la pubblicazione su Vercel, usa la versione di questo file
// che legge la chiave dalle "Environment Variables" (VITE_API_KEY) per non esporla pubblicamente.

const API_KEY = 'AIzaSyBxNxdh6eQ6HjhC97UYuyuxcGQfIiYjjeQ';

// Controlla se la chiave API è stata inserita. Se manca, le funzionalità IA non funzioneranno.
if (API_KEY.startsWith('AIzaSyBxNxdh6eQ6HjhC97UYuyuxcGQfIiYjjeQ')) {
  // Non bloccare l'app, ma avvisa nella console. Le chiamate all'API falliranno.
  console.warn("Chiave API Gemini mancante! Apri il file 'services/geminiService.ts' e inserisci la tua chiave API per abilitare le funzionalità di intelligenza artificiale.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates a list of subtasks for a given main task using the Gemini API.
 * @param taskText The text of the main task.
 * @returns A promise that resolves to an array of subtask strings.
 */
export const generateSubtasksFromGemini = async (taskText: string): Promise<string[]> => {
  if (API_KEY.startsWith('AIzaSyBxNxdh6eQ6HjhC97UYuyuxcGQfIiYjjeQ')) {
    alert("Funzionalità IA non attiva: manca la chiave API di Gemini nel file 'services/geminiService.ts'.");
    return [];
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: `Dato il task principale "${taskText}", suddividilo in una lista di sotto-task più piccoli e gestibili. Fornisci la risposta in formato JSON con un array di stringhe chiamato "subtasks".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: 'Un singolo sotto-task.'
              },
              description: 'Elenco dei sotto-task generati.'
            }
          },
          required: ['subtasks']
        },
      },
    });

    const jsonStr = response.text.trim();
    if (!jsonStr) {
        console.warn("Gemini returned an empty response.");
        return [];
    }
    
    const result: { subtasks: string[] } = JSON.parse(jsonStr);

    if (result && Array.isArray(result.subtasks)) {
      return result.subtasks.filter(s => typeof s === 'string' && s.trim() !== '');
    }

    console.warn("Parsed Gemini response is not in the expected format.", result);
    return [];

  } catch (error) {
    console.error("Errore durante la generazione dei sotto-task con Gemini:", error);
    return [];
  }
};

/**
 * Generates a list of tasks for a given routine name using the Gemini API.
 * @param routineName The name of the routine.
 * @returns A promise that resolves to an array of task strings.
 */
export const generateRoutineTasks = async (routineName: string): Promise<string[]> => {
  if (API_KEY.startsWith('AIzaSyBxNxdh6eQ6HjhC97UYuyuxcGQfIiYjjeQ')) {
    alert("Funzionalità IA non attiva: manca la chiave API di Gemini nel file 'services/geminiService.ts'.");
    return [];
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Data una routine chiamata "${routineName}", suggerisci una lista di compiti tipici per questa routine. Fornisci la risposta in formato JSON con un array di stringhe chiamato "tasks".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: 'Un singolo compito della routine.'
              },
              description: 'Elenco dei compiti generati per la routine.'
            }
          },
          required: ['tasks']
        },
      },
    });

    const jsonStr = response.text.trim();
    if (!jsonStr) {
      console.warn("Gemini returned an empty response for routine tasks.");
      return [];
    }
    
    const result: { tasks: string[] } = JSON.parse(jsonStr);

    if (result && Array.isArray(result.tasks)) {
      return result.tasks.filter(t => typeof t === 'string' && t.trim() !== '');
    }

    console.warn("Parsed Gemini response for routine tasks is not in the expected format.", result);
    return [];

  } catch (error) {
    console.error("Errore durante la generazione dei compiti di routine con Gemini:", error);
    return [];
  }
};