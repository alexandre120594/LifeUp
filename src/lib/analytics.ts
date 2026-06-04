import {
  Habit,
  Project,
  StudyMistake,
  StudyQuestionPractice,
  Task,
} from "@/types/BaseInterfaces";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function normalizeDate(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDaysWindow(days: number) {
  const result: { key: string; label: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = days - 1; index >= 0; index -= 1) {
    const current = new Date(today);
    current.setDate(today.getDate() - index);
    result.push({
      key: toDayKey(current),
      label: DAY_LABELS[current.getDay()],
    });
  }

  return result;
}

export function getTaskSummary(tasks: Task[] = []) {
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const completionRate =
    tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return {
    total: tasks.length,
    completed,
    pending,
    completionRate,
  };
}

export function buildActivityTrend(tasks: Task[] = [], habits: Habit[] = [], days = 7) {
  const window = buildDaysWindow(days);

  return window.map(({ key, label }) => {
    const tasksCompleted = tasks.filter((task) => {
      if (!task.completed) {
        return false;
      }

      const completedAt = normalizeDate(task.dateFinish ?? task.date);
      return completedAt ? toDayKey(completedAt) === key : false;
    }).length;

    const habitCheckIns = habits.reduce((total, habit) => {
      return total + (habit.history?.includes(key) ? 1 : 0);
    }, 0);

    return {
      date: label,
      tasksCompleted,
      habitCheckIns,
    };
  });
}

export function buildProjectPerformance(projects: Project[] = []) {
  return projects.map((project) => {
    const tasks = project.tasks ?? [];
    const completed = tasks.filter((task) => task.completed).length;
    const pending = tasks.length - completed;

    return {
      name: project.title,
      completed,
      pending,
      total: tasks.length,
      completionRate:
        tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      habits: project.habits?.length ?? 0,
    };
  });
}

export function buildHabitPerformance(habits: Habit[] = [], tasks: Task[] = []) {
  return habits.map((habit) => {
    const relatedTasks = tasks.filter((task) => task.habitId === habit.id);
    const completedTasks = relatedTasks.filter((task) => task.completed).length;
    const recentCheckIns = habit.history?.filter((date) => {
      const parsed = normalizeDate(date);
      if (!parsed) {
        return false;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lowerBound = new Date(today);
      lowerBound.setDate(today.getDate() - 6);

      return parsed >= lowerBound && parsed <= today;
    }).length;

    return {
      name: habit.title,
      projectName: habit.project?.title,
      streak: habit.streak ?? 0,
      totalTasks: relatedTasks.length,
      completedTasks,
      recentCheckIns,
    };
  });
}

export function getDueStudyMistakes(
  mistakes: StudyMistake[] = [],
  referenceDate = new Date()
) {
  const endOfDay = new Date(referenceDate);
  endOfDay.setHours(23, 59, 59, 999);

  return mistakes
    .filter((mistake) => {
      const reviewDate = normalizeDate(mistake.reviewDate);

      return (
        mistake.status !== "mastered" &&
        reviewDate !== null &&
        reviewDate <= endOfDay
      );
    })
    .sort((a, b) => {
      const aDate = normalizeDate(a.reviewDate)?.getTime() ?? 0;
      const bDate = normalizeDate(b.reviewDate)?.getTime() ?? 0;

      return aDate - bDate;
    });
}

export function buildWeakSubjectMistakes(mistakes: StudyMistake[] = []) {
  const subjects = new Map<
    string,
    {
      due: number;
      mastered: number;
      name: string;
      reviewed: number;
      subjectId: string;
      total: number;
      unresolved: number;
    }
  >();
  const dueMistakeIds = new Set(
    getDueStudyMistakes(mistakes).map((mistake) => mistake.id)
  );

  mistakes.forEach((mistake) => {
    const subjectId = mistake.subjectId;
    const current =
      subjects.get(subjectId) ??
      {
        due: 0,
        mastered: 0,
        name: mistake.subject?.name ?? "Subject",
        reviewed: 0,
        subjectId,
        total: 0,
        unresolved: 0,
      };

    current.total += 1;
    current.due += dueMistakeIds.has(mistake.id) ? 1 : 0;
    current.mastered += mistake.status === "mastered" ? 1 : 0;
    current.reviewed += mistake.status === "reviewed" ? 1 : 0;
    current.unresolved += mistake.status === "unresolved" ? 1 : 0;
    subjects.set(subjectId, current);
  });

  return Array.from(subjects.values()).sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total;
    }

    return b.due - a.due;
  });
}

export function buildStudyQuestionTrend(
  practices: StudyQuestionPractice[] = [],
  days = 7
) {
  const window = buildDaysWindow(days);

  return window.map(({ key, label }) => {
    const dayPractices = practices.filter((practice) => {
      const practiceDate = normalizeDate(practice.practiceDate);
      return practiceDate ? toDayKey(practiceDate) === key : false;
    });
    const correctQuestions = dayPractices.reduce(
      (total, practice) => total + practice.correctQuestions,
      0
    );
    const wrongQuestions = dayPractices.reduce(
      (total, practice) => total + practice.wrongQuestions,
      0
    );
    const totalQuestions = dayPractices.reduce(
      (total, practice) => total + practice.totalQuestions,
      0
    );

    return {
      date: label,
      correctQuestions,
      totalQuestions,
      wrongQuestions,
    };
  });
}

export function getStudyQuestionSummary(
  practices: StudyQuestionPractice[] = []
) {
  const totalQuestions = practices.reduce(
    (total, practice) => total + practice.totalQuestions,
    0
  );
  const correctQuestions = practices.reduce(
    (total, practice) => total + practice.correctQuestions,
    0
  );
  const wrongQuestions = practices.reduce(
    (total, practice) => total + practice.wrongQuestions,
    0
  );
  const accuracyRate =
    totalQuestions > 0
      ? Math.round((correctQuestions / totalQuestions) * 100)
      : 0;

  return {
    accuracyRate,
    correctQuestions,
    totalQuestions,
    wrongQuestions,
  };
}
