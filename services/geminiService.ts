import { GoogleGenAI, Type } from "@google/genai";

// --- ATTENZIONE: CONFIGURAZIONE RICHIESTA PER VERCEL ---
// Per far funzionare le funzionalità di intelligenza artificiale su Vercel,
// devi inserire qui la tua chiave API di Google Gemini.
// Sostituisci il valore segnaposto con la tua chiave.
const GEMINI_API_KEY = 'AIzaSyBxNxdh6eQ6HjhC97UYuyuxcGQfIiYjjeQ';

let aiClient: GoogleGenAI | null = null;

/**
 * Initializes the GoogleGenAI client using the API key from the constant.
 * This function is called before each API request and caches the client.
 * @returns An instance of GoogleGenAI or null if the API key is missing.
 */
const getAiClient = () => {
    if (aiClient) {
        return aiClient;
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyBxNxdh6eQ6HjhC97UYuyuxcGQfIiYjjeQ') {
        console.warn("La chiave API di Gemini non è configurata. Le funzionalità AI non saranno disponibili. Aggiungi la tua chiave nel file `services/geminiService.ts`.");
        return null;
    }

    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    return aiClient;
};


/**
 * Generates a motivational quote using the Gemini API.
 * @returns A promise that resolves to a motivational quote string.
 */
export const generateMotivationalQuote = async (): Promise<string> => {
    const ai = getAiClient();
    if (!ai) {
        return "Sii la versione migliore di te stesso.";
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Genera una frase motivazionale concisa e potente, adatta per un'app di produttività. La frase deve essere in italiano. Fornisci la risposta in formato JSON con una singola chiave 'quote'.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quote: {
                            type: Type.STRING,
                            description: 'La frase motivazionale generata.'
                        }
                    },
                    required: ['quote']
                },
            },
        });

        const jsonStr = response.text.trim();
        if (!jsonStr) {
            console.warn("Gemini returned an empty response for quote.");
            return "Inizia la tua giornata con un obiettivo.";
        }
        
        const result: { quote: string } = JSON.parse(jsonStr);

        if (result && typeof result.quote === 'string' && result.quote.trim() !== '') {
            return result.quote;
        }

        console.warn("Parsed Gemini response for quote is not in the expected format.", result);
        return "La disciplina è il ponte tra gli obiettivi e la realizzazione.";

    } catch (error) {
        console.error("Errore durante la generazione della frase motivazionale con Gemini:", error);
        return "Sii la versione migliore di te stesso.";
    }
};


/**
 * Generates a list of subtasks for a given main task using the Gemini API.
 * @param taskText The text of the main task.
 * @returns A promise that resolves to an array of subtask strings.
 */
export const generateSubtasksFromGemini = async (taskText: string): Promise<string[]> => {
  const ai = getAiClient();
  if (!ai) {
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
  const ai = getAiClient();
  if (!ai) {
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