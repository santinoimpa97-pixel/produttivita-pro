import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../i18n";

// --- CONFIGURAZIONE PER L'AMBIENTE DI SVILUPPO (AI Studio) ---
const apiKey = process.env.GEMINI_API_KEY;

let aiInstance: any = null;

const getAi = () => {
    if (!apiKey) {
        throw new Error("La chiave API di Gemini è mancante.");
    }
    if (!aiInstance) {
        aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
};

/**
 * Generates a motivational quote using the Gemini API.
 * @param language The language for the quote ('it' or 'en').
 * @returns A promise that resolves to a motivational quote string.
 */
export const generateMotivationalQuote = async (language: Language = 'it'): Promise<string> => {
    try {
        const langInstruction = language === 'en'
            ? `Generate a new, unique, concise and powerful motivational quote suitable for a productivity app. To ensure variety, seed your generation with this precise moment: ${new Date().toISOString()}. The quote must be in English.`
            : `Genera una frase motivazionale sempre nuova, unica, concisa e potente, adatta per un'app di produttività. Per garantire varietà, usa questo momento esatto come seme: ${new Date().toISOString()}. La frase deve essere in italiano.`;

        const response = await getAi().models.generateContent({
            model: "gemini-3-flash-preview",
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

        const jsonStr = response.text.trim();
        if (!jsonStr) {
            console.warn("Gemini returned an empty response for quote.");
            return language === 'en' ? "Start your day with a goal." : "Inizia la tua giornata con un obiettivo.";
        }
        
        const result: { quote: string } = JSON.parse(jsonStr);

        if (result && typeof result.quote === 'string' && result.quote.trim() !== '') {
            return result.quote;
        }

        console.warn("Parsed Gemini response for quote is not in the expected format.", result);
        return language === 'en' ? "Discipline is the bridge between goals and accomplishment." : "La disciplina è il ponte tra gli obiettivi e la realizzazione.";

    } catch (error) {
        console.error("Errore durante la generazione della frase motivazionale con Gemini:", error);
        return language === 'en' ? "Be the best version of yourself." : "Sii la versione migliore di te stesso.";
    }
};


/**
 * Generates a list of subtasks for a given main task using the Gemini API.
 * @param taskText The text of the main task.
 * @param language The language to generate subtasks in.
 * @returns A promise that resolves to an array of subtask strings.
 */
export const generateSubtasksFromGemini = async (taskText: string, language: Language = 'it'): Promise<string[]> => {
  try {
    const prompt = language === 'en'
        ? `Given the main task "${taskText}", break it down into smaller, manageable sub-tasks. Provide the response in JSON format with an array of strings called "subtasks".`
        : `Dato il task principale "${taskText}", suddividilo in una lista di sotto-task più piccoli e gestibili. Fornisci la risposta in formato JSON con un array di stringhe chiamato "subtasks".`;

    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview", 
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
 * @param language The language to generate tasks in.
 * @returns A promise that resolves to an array of task strings.
 */
export const generateRoutineTasks = async (routineName: string, language: Language = 'it'): Promise<string[]> => {
  try {
    const prompt = language === 'en'
        ? `Given a routine called "${routineName}", suggest a list of typical tasks for this routine. Provide the response in JSON format with an array of strings called "tasks".`
        : `Data una routine chiamata "${routineName}", suggerisci una lista di compiti tipici per questa routine. Fornisci la risposta in formato JSON con un array di stringhe chiamato "tasks".`;

    const response = await getAi().models.generateContent({
      model: "gemini-3-flash-preview",
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
 * Chats with the personal assistant, passing the profile context.
 */
export const chatWithAssistant = async (
    userMessage: string,
    history: { role: 'user' | 'model', content: string }[],
    profile: { bio: string; strengths: string; weaknesses: string; rules: string },
    language: Language = 'it'
): Promise<string> => {
    try {
        const systemPrompt = language === 'en'
            ? `You are the user's personal productivity coach and assistant.
You know the following about the user:
- Bio: ${profile.bio || 'Not specified'}
- Strengths: ${profile.strengths || 'Not specified'}
- Weaknesses: ${profile.weaknesses || 'Not specified'}
- Rules & Tone of voice: ${profile.rules || 'Be helpful and motivating.'}

Always respond taking this information into account. Be concise, empathetic, and actionable.`
            : `Sei il coach e assistente personale di produttività dell'utente.
Sai le seguenti cose sull'utente:
- Bio: ${profile.bio || 'Non specificata'}
- Punti di forza: ${profile.strengths || 'Non specificati'}
- Debolezze: ${profile.weaknesses || 'Non specificate'}
- Regole e Tono di voce: ${profile.rules || 'Sii d\'aiuto e motivante.'}

Rispondi sempre tenendo conto di queste informazioni. Sii conciso, empatico e orientato all'azione.`;

        // Format history for Gemini API
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const chat = getAi().chats.create({
            model: "gemini-3-flash-preview",
            history: formattedHistory,
            config: {
                systemInstruction: systemPrompt,
            }
        });

        const response = await chat.sendMessage({ message: userMessage });
        
        return response.text || (language === 'en' ? "I'm sorry, I couldn't process that." : "Scusa, non sono riuscito a elaborare la richiesta.");

    } catch (error) {
        console.error("Errore durante la chat con l'assistente:", error);
        return language === 'en' ? "An error occurred while talking to the assistant." : "Si è verificato un errore durante la comunicazione con l'assistente.";
    }
};
