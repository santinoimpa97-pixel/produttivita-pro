import { GoogleGenAI, Type } from "@google/genai";
import { motivationalQuotes } from '../data/quotes.ts';

// FIX: Per Gemini API guidelines, the API key must be sourced directly and exclusively
// from `process.env.API_KEY`. The placeholder and associated error checking logic have been removed,
// assuming the environment variable is correctly configured.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: The GEMINI_CONFIG_ERROR flag is no longer necessary as the API key is assumed to be available.
// It is set to false to maintain compatibility with App.tsx which imports it.
export const GEMINI_CONFIG_ERROR = false;

export const generateSubtasksFromGemini = async (taskText: string): Promise<string[]> => {
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