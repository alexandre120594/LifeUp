// src/types/index.ts

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: Date | string;
  projectId: string;
  habitId?: string | null;
}

export interface Habit {
  id: string;
  title: string;
  projectId: string;
  streak: number;
  history: string[];
  frequency: string;
  tasks?: Task[]; // Optional nested tasks
}

export interface Project {
  id: string;
  title: string;  
  color: string | null;
  userId: number;
  createdAt: Date | string;
  habits?: Habit[]; // Nested habits
  tasks?: Task[];   // Nested tasks
}

export interface ProjectRequest {
  title: string;
  color: string | null;
  userId: number;
  createdAt: Date | string;
  habits?: Habit[]; 
  tasks?: Task[]; 
}

export interface ProjectCreateInput {
  title: string;
  color: string;
}

// Interface specifically for the API Response
export type ProjectsResponse = Project[];