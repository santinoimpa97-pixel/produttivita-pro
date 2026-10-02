import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../i18n";
import { Task, Routine, Appointment, Priority, WorkoutRoutine, WorkoutExercise, MuscleGroup } from "../types";

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
export const generateMotivationalQuote = async (language: Language = 'it', forceRefresh: boolean = false): Promise<string> => {
    // Check local cache first if not forced
    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const cachedRaw = localStorage.getItem('produttivita_cached_quote');
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          const now = Date.now();
          // Valid for 12 hours
          if (parsed && parsed.quote && parsed.lang === language && (now - parsed.timestamp < 12 * 60 * 60 * 1000)) {
            return parsed.quote;
          }
        }
      } catch (e) {
        // ignore cache error
      }
    }

    try {
        const langInstruction = language === 'en'
            ? `Generate a fresh, unique, concise and deeply inspiring motivational quote for a productivity app (strictly 1 sentence).`
            : `Genera una frase motivazionale sempre fresca, unica, concisa e profondamente ispirante per un'app di produttività (rigorosamente 1 sola frase breve).`;

        const response = await getAi().models.generateContent({
            model: "gemini-2.5-flash",
            contents: langInstruction + " Provide the response in JSON format with a single key 'quote'.",
            config: {
                maxOutputTokens: 60,
                thinkingConfig: {
                    thinkingBudget: 0,
                },
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
            const finalQuote = result.quote.trim();
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('produttivita_cached_quote', JSON.stringify({
                  quote: finalQuote,
                  lang: language,
                  timestamp: Date.now()
                }));
              } catch {}
            }
            return finalQuote;
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
        maxOutputTokens: 200,
        thinkingConfig: {
          thinkingBudget: 0,
        },
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
        maxOutputTokens: 250,
        thinkingConfig: {
          thinkingBudget: 0,
        },
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
        maxOutputTokens: 600,
        thinkingConfig: {
          thinkingBudget: 0,
        },
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
- Profile & Bio: ${profile.bio || 'Not specified'}
- Strengths: ${profile.strengths || 'Not specified'}
- Weaknesses & Bottlenecks: ${profile.weaknesses || 'Not specified'}
- Rules & Tone: ${profile.rules || 'Be encouraging, concise, empathetic, and action-oriented.'}
- Today's date: ${todayStr}

CRITICAL STYLE & LENGTH RULES:
- Be EXTREMELY CONCISE, direct, and compact (max 2 to 3 short sentences or max 3 brief bullet points).
- NEVER produce walls of text or verbose introductions. The user expects instant, actionable clarity.

Action Execution:
If the user asks to add a task, appointment, note, or goal, include the action JSON block at the bottom of your message:
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
- Sii SEMPRE ESTREMAMENTE CONCISO, diretto e compatto (massimo da 2 a 3 frasi brevi, oppure massimo 3 sintetici punti elenco).
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

        const recentHistory = history.slice(-4);
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
                maxOutputTokens: 350,
                thinkingConfig: {
                    thinkingBudget: 0,
                },
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

export const transcribeAudioWithGemini = async (audioBlob: Blob, language: string = 'it'): Promise<string> => {
  const ai = getAi();

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result?.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });

  if (!base64Data) {
    throw new Error('Nessun dato audio rilevato.');
  }

  let mimeType = audioBlob.type || 'audio/mp4';
  if (mimeType.includes(';')) {
    mimeType = mimeType.split(';')[0];
  }

  const prompt = language === 'en'
    ? 'Accurately transcribe all spoken words in this audio. Return ONLY the transcribed text, with proper capitalization and punctuation. Do not include markdown code blocks, quotes, or any explanations.'
    : 'Trascrivi con la massima precisione tutte le parole pronunciate in questo audio. Restituisci ESCLUSIVAMENTE il testo trascritto, con punteggiatura e lettere maiuscole corrette. Non aggiungere virgolette, blocchi markdown, spiegazioni o saluti.';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        inlineData: {
          mimeType,
          data: base64Data
        }
      },
      {
        text: prompt
      }
    ]
  });

  return (response.text || '').trim();
};

export interface AiWorkoutParams {
  daysPerWeek: number; // 2, 3, 4
  goal: string;
  experienceLevel: 'beginner' | 'intermediate';
  notes?: string;
}

/**
 * Built-in Personal Trainer Engine.
 * Generates tailored, scientifically sound gym routines using the app's exact exercises.
 * Used whenever Gemini is offline, API key is suspended/missing, or network is unavailable.
 */
export const buildTailoredWorkoutRoutines = (
  params: AiWorkoutParams,
  language: Language = 'it'
): WorkoutRoutine[] => {
  const isEn = language === 'en';
  const isBeginner = params.experienceLevel === 'beginner';

  // Determine sets, reps, and rests based on goal
  let defaultReps = 10;
  let defaultSetsCount = 3;
  let defaultRest = 90;
  let repRangeLabel = isEn ? '3x10-12 reps' : '3 serie da 10-12 ripetizioni';

  const goalLower = params.goal.toLowerCase();
  if (goalLower.includes('massa') || goalLower.includes('mass') || goalLower.includes('ipertrofia')) {
    defaultReps = 10;
    defaultSetsCount = 3;
    defaultRest = 90;
    repRangeLabel = isEn ? '3x8-10 reps • Controlled eccentrics' : '3x8-10 reps • Movimento controllato';
  } else if (goalLower.includes('definizione') || goalLower.includes('tonif') || goalLower.includes('toning')) {
    defaultReps = 12;
    defaultSetsCount = 3;
    defaultRest = 60;
    repRangeLabel = isEn ? '3x12-15 reps • Short rest intervals' : '3x12-15 reps • Recuperi brevi';
  } else if (goalLower.includes('dimagr') || goalLower.includes('fat') || goalLower.includes('cardio')) {
    defaultReps = 15;
    defaultSetsCount = 3;
    defaultRest = 60;
    repRangeLabel = isEn ? '3x15 reps • High metabolic output' : '3x15 reps • Ritmo sostenuto';
  } else {
    defaultReps = 8;
    defaultSetsCount = 3;
    defaultRest = 90;
    repRangeLabel = isEn ? '3x8-10 reps • Strict technique' : '3x8-10 reps • Massima postura';
  }

  const createExercise = (
    exId: string,
    nameIt: string,
    nameEn: string,
    group: MuscleGroup,
    weightKg: number,
    notes?: string
  ): WorkoutExercise => ({
    id: `we-gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    exerciseId: exId,
    name: isEn ? nameEn : nameIt,
    muscleGroup: group,
    targetRestSeconds: defaultRest,
    notes: notes || repRangeLabel,
    sets: Array.from({ length: defaultSetsCount }, (_, idx) => ({
      id: `s-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
      setNumber: idx + 1,
      reps: defaultReps,
      weightKg,
      completed: false,
    }))
  });

  const routines: WorkoutRoutine[] = [];

  if (params.daysPerWeek === 4) {
    // 4 Days Split: Upper A, Lower A
    routines.push({
      id: `routine-ai-${Date.now()}-1`,
      title: isEn ? 'Upper Body (Chest, Back, Shoulders)' : 'Upper Body (Petto, Dorso, Spalle)',
      dayTag: isEn ? 'Day 1' : 'Giorno 1',
      description: isEn 
        ? 'Compound push and pull movements for upper body strength and posture.' 
        : 'Sessione spinta e tirata per petto, dorso e spalle.',
      estimatedDurationMin: 45,
      exercises: [
        createExercise('chest-press-machine', 'Chest Press Machine', 'Chest Press Machine', 'chest', isBeginner ? 25 : 40),
        createExercise('lat-pulldown', 'Lat Machine al Petto', 'Lat Pulldown', 'back', isBeginner ? 30 : 45),
        createExercise('shoulder-press-db', 'Lento Avanti con Manubri', 'Dumbbell Shoulder Press', 'shoulders', isBeginner ? 8 : 12),
        createExercise('seated-cable-row', 'Pulley Basso', 'Seated Cable Row', 'back', isBeginner ? 25 : 35),
        createExercise('dumbbell-curl', 'Curl Manubri Bicipiti', 'Dumbbell Bicep Curl', 'arms', isBeginner ? 8 : 12),
        createExercise('tricep-pushdown', 'Pushdown Corda Tricipiti', 'Cable Tricep Pushdown', 'arms', isBeginner ? 12 : 18),
      ]
    });

    routines.push({
      id: `routine-ai-${Date.now()}-2`,
      title: isEn ? 'Lower Body & Core' : 'Lower Body & Addome',
      dayTag: isEn ? 'Day 2' : 'Giorno 2',
      description: isEn 
        ? 'Leg strength, knee stabilization, and core endurance.' 
        : 'Lavoro completo su gambe, glutei e stabilità del core.',
      estimatedDurationMin: 45,
      exercises: [
        createExercise('leg-press', 'Leg Press a 45°', '45° Leg Press', 'legs', isBeginner ? 40 : 80),
        createExercise('goblet-squat', 'Goblet Squat con Manubrio', 'Goblet Squat', 'legs', isBeginner ? 10 : 16),
        createExercise('leg-extension', 'Leg Extension', 'Leg Extension Machine', 'legs', isBeginner ? 20 : 35),
        createExercise('leg-curl', 'Leg Curl Femorali', 'Leg Curl Machine', 'legs', isBeginner ? 20 : 30),
        createExercise('plank', 'Plank Isometrico', 'Plank', 'core', 0, isEn ? '3x30-45 sec' : '3 serie da 30-45 secondi'),
        createExercise('cable-crunch', 'Crunch Addominali', 'Floor Crunch', 'core', 0),
      ]
    });
  } else {
    // 2 or 3 Days: Full Body A & Full Body B
    routines.push({
      id: `routine-ai-${Date.now()}-1`,
      title: isEn ? `Full Body ${params.daysPerWeek}x - Day A (Foundations)` : `Full Body ${params.daysPerWeek}x - Scheda A (Fondamentali)`,
      dayTag: isEn ? 'Day A' : 'Giorno A',
      description: isEn 
        ? 'Complete stimulus across major muscle groups with safe, progressive machine and free weight movements.' 
        : 'Stimolo completo sui grandi gruppi muscolari con macchine guidate e carichi sicuri per iniziare al meglio.',
      estimatedDurationMin: 45,
      exercises: [
        createExercise('leg-press', 'Leg Press a 45°', '45° Leg Press', 'legs', isBeginner ? 40 : 60),
        createExercise('chest-press-machine', 'Chest Press Machine', 'Chest Press Machine', 'chest', isBeginner ? 25 : 35),
        createExercise('lat-pulldown', 'Lat Machine al Petto', 'Lat Pulldown', 'back', isBeginner ? 30 : 40),
        createExercise('shoulder-press-db', 'Lento Avanti con Manubri', 'Dumbbell Shoulder Press', 'shoulders', isBeginner ? 8 : 12),
        createExercise('dumbbell-curl', 'Curl Manubri Bicipiti', 'Dumbbell Bicep Curl', 'arms', isBeginner ? 8 : 10),
        createExercise('plank', 'Plank Isometrico', 'Plank', 'core', 0, isEn ? '3x30-45 sec' : '3x30-45 sec tenuta'),
      ]
    });

    routines.push({
      id: `routine-ai-${Date.now()}-2`,
      title: isEn ? `Full Body ${params.daysPerWeek}x - Day B (Variation)` : `Full Body ${params.daysPerWeek}x - Scheda B (Variante)`,
      dayTag: isEn ? 'Day B' : 'Giorno B',
      description: isEn 
        ? 'Complementary compound movements with dumbbells and cables for muscular balance.' 
        : 'Esercizi complementari con manubri e cavi per equilibrio muscolare e braccia.',
      estimatedDurationMin: 45,
      exercises: [
        createExercise('goblet-squat', 'Goblet Squat con Manubrio', 'Goblet Squat', 'legs', isBeginner ? 10 : 14),
        createExercise('incline-db-press', 'Spinte Manubri Panca Inclinata', 'Incline DB Press', 'chest', isBeginner ? 10 : 14),
        createExercise('seated-cable-row', 'Pulley Basso al Bacino', 'Seated Cable Row', 'back', isBeginner ? 25 : 35),
        createExercise('lateral-raises', 'Alzate Laterali Manubri', 'Lateral Raises', 'shoulders', isBeginner ? 5 : 7),
        createExercise('tricep-pushdown', 'Pushdown Corda Tricipiti', 'Cable Tricep Pushdown', 'arms', isBeginner ? 12 : 18),
        createExercise('cable-crunch', 'Crunch Addome a Terra', 'Floor Crunch', 'core', 0),
      ]
    });
  }

  return routines;
};

export const generateWorkoutRoutinesWithGemini = async (
  params: AiWorkoutParams,
  language: Language = 'it'
): Promise<WorkoutRoutine[]> => {
  try {
    const key = getEffectiveGeminiApiKey();
    if (!key) {
      return buildTailoredWorkoutRoutines(params, language);
    }

    const ai = getAi();
    
    const prompt = language === 'en'
      ? `You are an elite personal trainer. Generate a personalized gym routine plan for a ${params.experienceLevel} trainee.
Days per week: ${params.daysPerWeek}.
Goal: ${params.goal}.
Additional notes: ${params.notes || 'None'}.

Available exercise IDs to choose from:
- chest: bench-press (Barbell Bench Press), incline-db-press (Incline DB Press), chest-press-machine (Chest Press Machine)
- back: lat-pulldown (Lat Pulldown), seated-cable-row (Seated Cable Row), dumbbell-row (Dumbbell Row)
- legs: leg-press (45° Leg Press), goblet-squat (Goblet Squat), leg-extension (Leg Extension), leg-curl (Leg Curl)
- shoulders: shoulder-press-db (DB Shoulder Press), lateral-raises (Lateral Raises)
- arms: dumbbell-curl (DB Bicep Curl), tricep-pushdown (Cable Tricep Pushdown)
- core: plank (Plank), cable-crunch (Floor Crunch)

Return a JSON object with this exact structure:
{
  "routines": [
    {
      "title": "Routine Title",
      "dayTag": "Day A",
      "description": "Short explanation of focus",
      "estimatedDurationMin": 45,
      "exercises": [
        {
          "exerciseId": "leg-press",
          "name": "Leg Press a 45°",
          "muscleGroup": "legs",
          "targetRestSeconds": 90,
          "notes": "3x10-12 with controlled form",
          "sets": [
            { "setNumber": 1, "reps": 12, "weightKg": 40 },
            { "setNumber": 2, "reps": 10, "weightKg": 50 },
            { "setNumber": 3, "reps": 10, "weightKg": 50 }
          ]
        }
      ]
    }
  ]
}
Generate ${params.daysPerWeek >= 2 ? 2 : 1} routines. Include 5-6 exercises per routine.`
      : `Sei un personal trainer certificato di alto livello. Crea un piano di allenamento personalizzato per una persona che è al livello: ${params.experienceLevel === 'beginner' ? 'Principiante in palestra (ha iniziato da poco)' : 'Intermedio'}.
Frequenza settimanale: ${params.daysPerWeek} giorni a settimana.
Obiettivo: ${params.goal}.
Note/Preferenze: ${params.notes || 'Nessuna'}.

Esercizi disponibili nel database dell'app tra cui scegliere:
- petto: bench-press (Panca Piana con Bilanciere), incline-db-press (Spinte Manubri Panca Inclinata), chest-press-machine (Chest Press Machine)
- dorso: lat-pulldown (Lat Machine), seated-cable-row (Pulley Basso), dumbbell-row (Rematore Manubrio)
- gambe: leg-press (Leg Press a 45°), goblet-squat (Goblet Squat Manubrio), leg-extension (Leg Extension), leg-curl (Leg Curl)
- spalle: shoulder-press-db (Lento Avanti Manubri), lateral-raises (Alzate Laterali)
- braccia: dumbbell-curl (Curl Bicipiti Manubri), tricep-pushdown (Pushdown Tricipiti Corda)
- addome: plank (Plank Isometrico), cable-crunch (Crunch Tappetino)

Rispondi ESCLUSIVAMENTE con un JSON valido con questa struttura esatta:
{
  "routines": [
    {
      "title": "Nome Scheda",
      "dayTag": "Giorno A",
      "description": "Breve descrizione del focus muscolare",
      "estimatedDurationMin": 45,
      "exercises": [
        {
          "exerciseId": "leg-press",
          "name": "Leg Press a 45°",
          "muscleGroup": "legs",
          "targetRestSeconds": 90,
          "notes": "3 serie da 10-12 con peso controllato",
          "sets": [
            { "setNumber": 1, "reps": 12, "weightKg": 40 },
            { "setNumber": 2, "reps": 10, "weightKg": 50 },
            { "setNumber": 3, "reps": 10, "weightKg": 50 }
          ]
        }
      ]
    }
  ]
}
Genera ${params.daysPerWeek >= 2 ? 2 : 1} schede (es. Giorno A e Giorno B) bilanciate, con 5-6 esercizi ciascuna, serie da 3 o 4, ripetizioni e carichi di partenza ragionevoli per chi inizia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 1500,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    let rawText = (response.text || '').trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(rawText || '{}');
    const rawRoutines = parsed.routines || [];

    if (!Array.isArray(rawRoutines) || rawRoutines.length === 0) {
      return buildTailoredWorkoutRoutines(params, language);
    }

    return rawRoutines.map((r: any, rIdx: number) => ({
      id: `ai-routine-${Date.now()}-${rIdx}`,
      title: r.title || `Scheda ${r.dayTag || rIdx + 1}`,
      dayTag: r.dayTag || `Giorno ${String.fromCharCode(65 + rIdx)}`,
      description: r.description || 'Scheda personalizzata generata dal Coach IA',
      estimatedDurationMin: r.estimatedDurationMin || 45,
      exercises: (r.exercises || []).map((ex: any, exIdx: number) => ({
        id: `ai-ex-${Date.now()}-${rIdx}-${exIdx}`,
        exerciseId: ex.exerciseId || 'chest-press-machine',
        name: ex.name || 'Esercizio',
        muscleGroup: (ex.muscleGroup || 'chest') as MuscleGroup,
        targetRestSeconds: ex.targetRestSeconds || 90,
        notes: ex.notes || 'Controlla il movimento',
        sets: (ex.sets || [
          { setNumber: 1, reps: 10, weightKg: 20 },
          { setNumber: 2, reps: 10, weightKg: 20 },
          { setNumber: 3, reps: 10, weightKg: 20 }
        ]).map((s: any, sIdx: number) => ({
          id: `s-${Date.now()}-${rIdx}-${exIdx}-${sIdx}`,
          setNumber: s.setNumber || sIdx + 1,
          reps: s.reps || 10,
          weightKg: s.weightKg || 15,
          completed: false
        }))
      }))
    }));
  } catch (error) {
    console.warn('Gemini API call failed or suspended key, falling back to local personal trainer generator:', error);
    return buildTailoredWorkoutRoutines(params, language);
  }
};

