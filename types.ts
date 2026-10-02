export enum Priority {
  High = 'Alta',
  Medium = 'Media',
  Low = 'Bassa',
}

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  subTasks: SubTask[];
}

export interface User {
  id: string;
  displayName: string;
  email: string;
}

export interface RoutineTask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Routine {
    id: string;
    name: string;
    tasks: RoutineTask[];
}

export interface RoutineTemplate {
    id: string;
    name: string;
    tasks: { text: string }[];
}

export interface Appointment {
    id: string;
    text: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    notify?: boolean;
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    targetDate: string | null;
    completed: boolean;
    linkedTaskIds: string[];
}

export interface Note {
    id: string;
    title: string;
    content: string;
    updatedAt: string;
}

export interface AssistantProfile {
    bio: string;
    strengths: string;
    weaknesses: string;
    rules: string;
}

export interface ChatMessage {
    id?: string;
    role: 'user' | 'model';
    content: string;
}

// --- FITNESS & WORKOUT TYPES ---

export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';

export interface ExerciseGuide {
  id: string;
  name: string;
  nameEn: string;
  muscleGroup: MuscleGroup;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment: 'barbell' | 'dumbbell' | 'machine' | 'cables' | 'bodyweight';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  viewType: 'front' | 'back';
  setup: string;
  setupEn: string;
  execution: string;
  executionEn: string;
  commonMistakes: string[];
  commonMistakesEn: string[];
  tip?: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: WorkoutSet[];
  notes?: string;
  targetRestSeconds?: number;
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  description: string;
  dayTag: string; // e.g., 'Giorno A', 'Push', 'Full Body 1'
  exercises: WorkoutExercise[];
  estimatedDurationMin: number;
}

export interface CompletedWorkoutLog {
  id: string;
  routineTitle: string;
  date: string; // ISO string
  durationMinutes: number;
  totalVolumeKg: number;
  exercisesCompleted: number;
  totalSets: number;
  notes?: string;
}

export interface WeeklyScheduleDay {
  dayIndex: number; // 0 = Domenica, 1 = Lunedì, 2 = Martedì, ..., 6 = Sabato
  dayName: string;
  shortName: string;
  isWorkoutDay: boolean;
  assignedRoutineId?: string;
  assignedRoutineTitle?: string;
  assignedDayTag?: string;
}


