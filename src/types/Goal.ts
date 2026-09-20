export type GoalStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

export interface Goal {
  id: string;
  userId: number;
  title: string;
  description?: string | null;
  status: GoalStatus;
  progress: number;
  targetDate?: Date | string | null;
  color?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GoalCreateInput {
  title: string;
  description?: string | null;
  status?: GoalStatus;
  progress?: number;
  targetDate?: string | null;
  color?: string | null;
}

export interface GoalUpdateInput {
  title?: string;
  description?: string | null;
  status?: GoalStatus;
  progress?: number;
  targetDate?: string | null;
  color?: string | null;
}
