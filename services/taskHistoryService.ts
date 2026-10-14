import { Priority, Task, TaskHistoryItem } from '../types';

const TASK_HISTORY_STORAGE_KEY = 'produttivita_task_history_v1';

const DEFAULT_SUGGESTIONS: TaskHistoryItem[] = [
  { text: 'Fare la spesa settimanale', priority: Priority.Medium, count: 4, lastUsed: new Date().toISOString() },
  { text: 'Allenamento in palestra', priority: Priority.High, count: 5, lastUsed: new Date().toISOString() },
  { text: 'Controllare e rispondere alle email', priority: Priority.Medium, count: 3, lastUsed: new Date().toISOString() },
  { text: 'Inviare report settimanale', priority: Priority.High, count: 3, lastUsed: new Date().toISOString() },
  { text: 'Sessione di studio / lettura (30 min)', priority: Priority.Low, count: 2, lastUsed: new Date().toISOString() },
  { text: 'Pianificare gli obiettivi della settimana', priority: Priority.High, count: 2, lastUsed: new Date().toISOString() },
];

/**
 * Loads task history from localStorage and merges with any current tasks
 */
export function getTaskHistory(existingTasks: Task[] = []): TaskHistoryItem[] {
  let history: TaskHistoryItem[] = [];

  try {
    const raw = localStorage.getItem(TASK_HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        history = parsed;
      }
    }
  } catch (err) {
    console.error('Error loading task history from localStorage', err);
  }

  // If no history exists yet, seed with defaults
  if (history.length === 0) {
    history = [...DEFAULT_SUGGESTIONS];
  }

  // Merge any existing active/completed tasks if not already present
  let hasMerged = false;
  if (Array.isArray(existingTasks) && existingTasks.length > 0) {
    for (const t of existingTasks) {
      if (!t.text || !t.text.trim()) continue;
      const clean = t.text.trim();
      const existing = history.find(h => h.text.toLowerCase() === clean.toLowerCase());
      if (!existing) {
        history.push({
          text: clean,
          priority: t.priority || Priority.Medium,
          count: 1,
          lastUsed: new Date().toISOString()
        });
        hasMerged = true;
      }
    }
  }

  if (hasMerged) {
    saveTaskHistory(history);
  }

  return sortHistory(history);
}

/**
 * Saves task history to localStorage
 */
function saveTaskHistory(history: TaskHistoryItem[]): void {
  try {
    localStorage.setItem(TASK_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Error saving task history', err);
  }
}

/**
 * Sorts history by usage count descending, then by lastUsed descending
 */
function sortHistory(items: TaskHistoryItem[]): TaskHistoryItem[] {
  return [...items].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
  });
}

/**
 * Records a new task or updates existing task in history
 */
export function recordTaskInHistory(text: string, priority: Priority = Priority.Medium): TaskHistoryItem[] {
  const clean = text.trim();
  if (!clean) return getTaskHistory();

  let history = getTaskHistory();
  const matchIndex = history.findIndex(h => h.text.toLowerCase() === clean.toLowerCase());

  if (matchIndex >= 0) {
    history[matchIndex] = {
      ...history[matchIndex],
      text: clean, // keep the latest casing
      priority,
      count: history[matchIndex].count + 1,
      lastUsed: new Date().toISOString()
    };
  } else {
    history.unshift({
      text: clean,
      priority,
      count: 1,
      lastUsed: new Date().toISOString()
    });
  }

  // Keep up to 60 most relevant tasks
  history = sortHistory(history).slice(0, 60);
  saveTaskHistory(history);
  return history;
}

/**
 * Removes an item from task history
 */
export function removeTaskFromHistory(textToRemove: string): TaskHistoryItem[] {
  const clean = textToRemove.trim().toLowerCase();
  let history = getTaskHistory();
  history = history.filter(h => h.text.toLowerCase() !== clean);
  saveTaskHistory(history);
  return history;
}
