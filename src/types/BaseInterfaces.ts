// src/types/index.ts

export interface Task {
  id: string;
  title?: string;
  completed?: boolean;
  date?: Date | string;
  projectId?: string;
  habitId?: string | null;
  dateFinish?: Date | string;
  time?: string;
}

export interface Habit {
  id: string;
  title: string;
  projectId: string;
  streak: number;
  history: string[];
  frequency: string;
  tasks?: Task[];
  project?: Project; 
}

export interface Project {
  id: string;
  title: string;  
  color: string;
  userId: number;
  lastActivityDate?: Date | string;
  streakGlobal?:number
  createdAt: Date | string;
  habits?: Habit[]; 
  tasks?: Task[]; 
}
export interface ProjectRequest {
  title: string;
  color: string | null;
  userId: number;
  createdAt: Date | string;
  lastActivityDate?: Date | string;
  streakGlobal?:number
  habits?: Habit[]; 
  tasks?: Task[]; 
}

export interface ProjectCreateInput {
  title?: string;
  color?: string;
}

export interface HabitCreateInput {
  title: string;
  projectId?: string;
}

export interface TaskCreateInput {
  title: string;
  projectId: string;
  habitId: string;
}

export type ProjectsResponse = Project[];