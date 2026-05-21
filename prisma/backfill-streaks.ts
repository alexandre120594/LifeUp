import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client";
import { calculateHabitState, calculateProjectStreak } from "../src/lib/streaks";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

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

    const streakState = calculateProjectStreak(
      completedDates,
      project.dailyStreakTarget
    );

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
