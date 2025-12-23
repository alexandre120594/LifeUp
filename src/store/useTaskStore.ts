import Habits from "@/app/habits/page";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

interface TaskState {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [
    { id: "1", title: "Plan the app structure", completed: true },
    { id: "2", title: "Build the frontend store", completed: false },
  ],
  addTask: (title) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        { id: Date.now().toString(), title, completed: false },
      ],
    })),
  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
}));

export type Habit = {
  id: string;
  title: string;
  completedToday: boolean;
  streak: number;
  history: string[];
};

interface HabitState {
  habits: Habit[];
  toggleHabit: (id: string) => void;
  addTask: (text: string) => void;
  deleteHabit: (text: string) => void;
  editHabit: (id: string, text: string) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [
        {
          id: "h1",
          title: "Drink 2L Water",
          completedToday: false,
          streak: 5,
          history: ["2025-12-15", "2025-12-16", "2025-12-17"],
        },
        {
          id: "h2",
          title: "Drink 3L Water",
          completedToday: false,
          streak: 6,
          history: ["2025-12-18", "2025-12-19", "2025-12-20"],
        },
      ],
      addTask: (text) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              id: Date.now().toString(),
              title: text,
              completedToday: false,
              streak: 0,
              history: [Date.now().toString()],
            },
          ],
        })),
      toggleHabit: (id) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id === id) {
              const today = new Date().toISOString().split("T")[0];
              const isCompleting = !h.completedToday;

              const newHistory = isCompleting
                ? [...h.history, today]
                : h.history.filter((date) => date !== today);

              return {
                ...h,
                completedToday: isCompleting,
                history: newHistory,
                streak: isCompleting ? h.streak + 1 : Math.max(0, h.streak - 1),
              };
            }
            return h;
          }),
        })),
      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((t) => t.id !== id),
      })),
      editHabit: (id, text) => set((state) => ({
        habits: state.habits.map((h) => {
            if (h.id === id) {
              const today = new Date().toISOString().split("T")[0];
              return {
                completedToday: false,
                history: [...h.history, today],
                streak: h.streak,
                id: h.id,
                title: text
              };
            }
            return h;
          })
      }))
    }),
    { name: "lifeup-storage" }
  )
);
