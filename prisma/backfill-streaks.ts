import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function calculateProjectStreak(dates: Date[]) {
  const validDates = dates.filter((date) => !Number.isNaN(date.getTime()));

  if (validDates.length === 0) {
    return {
      streakGlobal: 0,
      lastActivityDate: null as Date | null,
    };
  }

  const uniqueDays = Array.from(new Set(validDates.map((date) => toDayKey(date)))).sort();

  let streakGlobal = 1;

  for (let index = uniqueDays.length - 1; index > 0; index -= 1) {
    const current = new Date(`${uniqueDays[index]}T00:00:00.000Z`);
    const previous = new Date(`${uniqueDays[index - 1]}T00:00:00.000Z`);
    const diffInDays =
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays === 1) {
      streakGlobal += 1;
    } else {
      break;
    }
  }

  return {
    streakGlobal,
    lastActivityDate: new Date(`${uniqueDays[uniqueDays.length - 1]}T00:00:00.000Z`),
  };
}

function calculateHabitState(dates: Date[]) {
  const validDates = dates.filter((date) => !Number.isNaN(date.getTime()));
  const history = Array.from(new Set(validDates.map((date) => toDayKey(date)))).sort();

  if (history.length === 0) {
    return {
      history: [] as string[],
      streak: 0,
    };
  }

  const todayKey = toDayKey(new Date());
  const latestKey = history[history.length - 1];
  let streak = 0;

  if (latestKey === todayKey) {
    streak = 1;

    for (let index = history.length - 1; index > 0; index -= 1) {
      const current = new Date(`${history[index]}T00:00:00.000Z`);
      const previous = new Date(`${history[index - 1]}T00:00:00.000Z`);
      const diffInDays =
        (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

      if (diffInDays === 1) {
        streak += 1;
      } else {
        break;
      }
    }
  }

  return {
    history,
    streak,
  };
}

async function main() {
  const projects = await prisma.project.findMany({
    include: {
      tasks: {
        select: {
          completed: true,
          date: true,
          dateFinish: true,
        },
      },
    },
  });

  const habits = await prisma.habit.findMany({
    include: {
      tasks: {
        select: {
          completed: true,
          date: true,
          dateFinish: true,
        },
      },
    },
  });

  for (const project of projects) {
    const completedDates = project.tasks
      .filter((task) => task.completed)
      .map((task) => new Date(task.dateFinish ?? task.date));

    const streakState = calculateProjectStreak(completedDates);

    await prisma.project.update({
      where: { id: project.id },
      data: {
        streakGlobal: streakState.streakGlobal,
        lastActivityDate: streakState.lastActivityDate,
      },
    });
  }

  for (const habit of habits) {
    const completedDates = habit.tasks
      .filter((task) => task.completed)
      .map((task) => new Date(task.dateFinish ?? task.date));

    const habitState = calculateHabitState(completedDates);

    await prisma.habit.update({
      where: { id: habit.id },
      data: {
        history: habitState.history,
        streak: habitState.streak,
      },
    });
  }

  console.log(
    `Backfilled ${projects.length} projects and ${habits.length} habits.`
  );
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
