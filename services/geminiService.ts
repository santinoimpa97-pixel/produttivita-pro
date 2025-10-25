import { GoogleGenAI, Type } from "@google/genai";
import { motivationalQuotes } from '../data/quotes.js';

// INIZIA LA CONFIGURAZIONE
// Per lo sviluppo locale, inserisci qui la tua chiave API di Gemini.
// Per il deployment (es. Vercel), l'app userà automaticamente la variabile d'ambiente.
const API_KEY_PLACEHOLDER = "INSERISCI_QUI_LA_TUA_CHIAVE_API_GEMINI";
// FINE CONFIGURAZIONE

// La chiave API di Gemini viene fornita prima dalla variabile d'ambiente,
// poi dal placeholder sopra, per flessibilità tra development e production.
const apiKey = process.env.API_KEY || API_KEY_PLACEHOLDER;

export let GEMINI_CONFIG_ERROR = false;
if (apiKey.startsWith("INSERISCI_QUI")) {
    GEMINI_CONFIG_ERROR = true;
    console.error("CONFIGURAZIONE GEMINI MANCANTE: Inserisci la tua API_KEY in services/geminiService.ts o imposta la variabile d'ambiente API_KEY.");
}

const ai = GEMINI_CONFIG_ERROR ? null! : new GoogleGenAI({ apiKey });

export const generateSubtasksFromGemini = async (taskText: string): Promise<string[]> => {
  if (GEMINI_CONFIG_ERROR) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: `Dato il task principale "${taskText}", suddividilo in una lista di sotto-task più piccoli e gestibili. Fornisci la risposta in formato JSON con un array di stringhe chiamato "subtasks".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { subtasks: { type: Type.ARRAY, items: { type: Type.STRING } } },
          required: ['subtasks']
        },
      },
    });
    const result: { subtasks: string[] } = JSON.parse(response.text.trim());
    return result?.subtasks || [];
  } catch (error) {
    console.error("Errore durante la generazione dei sotto-task con Gemini:", error);
    return [];
  }
};

export const generateRoutineTasks = async (routineName: string): Promise<string[]> => {
  if (GEMINI_CONFIG_ERROR) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Data una routine chiamata "${routineName}", suggerisci una lista di compiti tipici per questa routine. Fornisci la risposta in formato JSON con un array di stringhe chiamato "tasks".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { tasks: { type: Type.ARRAY, items: { type: Type.STRING } } },
          required: ['tasks']
        },
      },
    });
    const result: { tasks: string[] } = JSON.parse(response.text.trim());
    return result?.tasks || [];
  } catch (error) {
    console.error("Errore durante la generazione dei compiti di routine con Gemini:", error);
    return [];
  }
};

export const generateMotivationalQuote = async (): Promise<string> => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return Promise.resolve(motivationalQuotes[randomIndex]);
};