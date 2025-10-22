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
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    targetDate: string | null;
    completed: boolean;
    linkedTaskIds: string[];
}
