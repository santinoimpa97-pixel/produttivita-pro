import { GoogleGenAI, Type } from "@google/genai";
import { motivationalQuotes } from '../data/quotes';

// --- CONFIGURAZIONE PER DEPLOYMENT (Vercel) ---
// La chiave API viene letta dalla variabile d'ambiente 'API_KEY'.
// Assicurati di aver impostato API_KEY nelle impostazioni del tuo progetto su Vercel.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    throw new Error("La chiave API di Gemini (API_KEY) è mancante.");
}
const ai = new GoogleGenAI({ apiKey });


/**
 * Generates a list of subtasks for a given main task using the Gemini API.
 * @param taskText The text of the main task.
 * @returns A promise that resolves to an array of subtask strings.
 */
export const generateSubtasksFromGemini = async (taskText: string): Promise<string[]> => {
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
    // In caso di un errore (e.g. invalid API key), return an empty array and do not block the app.
    return [];
  }
};

/**
 * Generates a list of tasks for a given routine name using the Gemini API.
 * @param routineName The name of the routine.
 * @returns A promise that resolves to an array of task strings.
 */
export const generateRoutineTasks = async (routineName: string): Promise<string[]> => {
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

/**
 * Returns a random motivational quote from a predefined list.
 * @returns A promise that resolves to a quote string.
 */
export const generateMotivationalQuote = async (): Promise<string> => {
    // We make this async to match the expected usage in App.tsx, 
    // but it resolves immediately with a local quote to improve performance and reliability.
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return Promise.resolve(motivationalQuotes[randomIndex]);
};