// src/services/PomodoroService.ts
import { PomodoroSession } from "@/types/pomodore";

export class PomodoroService {

  static async getByTaskId(taskId: string): Promise<PomodoroSession[]> {
    const res = await fetch(`/api/pomodoro?taskId=${taskId}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch pomodoro history");
    return res.json();
  }
  static async start(taskId: string, duration: string): Promise<PomodoroSession> {
    const res = await fetch("/api/pomodoro/start", {
      method: "POST",
      body: JSON.stringify({ taskId, duration }),
    });

    if (!res.ok) throw new Error("Failed to start pomodoro");
    return res.json();
  }

   static async update(id: string, duration: string, status: string): Promise<PomodoroSession> {
    const res = await fetch("/api/pomodoro/start", {
      method: "PATCH",
      body: JSON.stringify({ id, duration, status }),
    });

    if (!res.ok) throw new Error("Failed to start pomodoro");
    return res.json();
  }


  static async finish(pomodoroId: string) {
    const res = await fetch("/api/pomodoro/finish", {
      method: "POST",
      body: JSON.stringify({ pomodoroId }),
    });

    if (!res.ok) throw new Error("Failed to finish pomodoro");
    return res.json();
  }

  static async interrupt(pomodoroId?: string, duration?: string) {
    const res = await fetch("/api/pomodoro/interrupt", {
      method: "POST",
      body: JSON.stringify({ pomodoroId, duration}),
    });

    if (!res.ok) throw new Error("Failed to interrupt pomodoro");
    return res.json();
  }
}
