import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

function dayOffset(daysAgo: number, hour = 9) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function isoDay(daysAgo: number) {
  return dayOffset(daysAgo).toISOString().slice(0, 10);
}

const STUDY_QUESTION_SEED_NOTE = "LifeUp demo question analytics";

async function main() {
  const devUser =
    (await prisma.user.findUnique({
      where: { id: 1 },
    })) ??
    (await prisma.user.create({
      data: {
        id: 1,
        email: "dev@lifeup.local",
        name: "LifeUp Dev",
      },
    }));

  const seededTitles = [
    "Health Reset",
    "Frontend Mastery",
    "Language Sprint",
  ];

  await prisma.project.deleteMany({
    where: {
      userId: devUser.id,
      title: { in: seededTitles },
    },
  });

  const healthProject = await prisma.project.create({
    data: {
      title: "Health Reset",
      color: "#22c55e",
      userId: devUser.id,
      streakGlobal: 4,
      lastActivityDate: dayOffset(0, 18),
      createdAt: dayOffset(21, 10),
    },
  });

  const frontendProject = await prisma.project.create({
    data: {
      title: "Frontend Mastery",
      color: "#3b82f6",
      userId: devUser.id,
      streakGlobal: 3,
      lastActivityDate: dayOffset(1, 20),
      createdAt: dayOffset(18, 10),
    },
  });

  const languageProject = await prisma.project.create({
    data: {
      title: "Language Sprint",
      color: "#f97316",
      userId: devUser.id,
      streakGlobal: 5,
      lastActivityDate: dayOffset(0, 21),
      createdAt: dayOffset(14, 10),
    },
  });

  const morningWalk = await prisma.habit.create({
    data: {
      title: "Morning Walk",
      projectId: healthProject.id,
      streak: 4,
      frequency: "daily",
      history: [isoDay(6), isoDay(4), isoDay(2), isoDay(1), isoDay(0)],
    },
  });

  const hydrate = await prisma.habit.create({
    data: {
      title: "Hydrate",
      projectId: healthProject.id,
      streak: 6,
      frequency: "daily",
      history: [
        isoDay(6),
        isoDay(5),
        isoDay(4),
        isoDay(3),
        isoDay(2),
        isoDay(1),
        isoDay(0),
      ],
    },
  });

  const shippingPractice = await prisma.habit.create({
    data: {
      title: "Ship UI Practice",
      projectId: frontendProject.id,
      streak: 3,
      frequency: "daily",
      history: [isoDay(5), isoDay(3), isoDay(2), isoDay(0)],
    },
  });

  const reviewPatterns = await prisma.habit.create({
    data: {
      title: "Review Patterns",
      projectId: frontendProject.id,
      streak: 2,
      frequency: "daily",
      history: [isoDay(4), isoDay(1)],
    },
  });

  const vocabulary = await prisma.habit.create({
    data: {
      title: "Vocabulary Review",
      projectId: languageProject.id,
      streak: 5,
      frequency: "daily",
      history: [isoDay(6), isoDay(4), isoDay(3), isoDay(1), isoDay(0)],
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "30 min cardio",
        projectId: healthProject.id,
        habitId: morningWalk.id,
        completed: true,
        date: dayOffset(2, 7),
        dateFinish: dayOffset(2, 8),
        time: "08:00",
      },
      {
        title: "Stretching routine",
        projectId: healthProject.id,
        habitId: morningWalk.id,
        completed: false,
        date: dayOffset(0, 7),
        time: "07:30",
      },
      {
        title: "Drink 2L of water",
        projectId: healthProject.id,
        habitId: hydrate.id,
        completed: true,
        date: dayOffset(0, 9),
        dateFinish: dayOffset(0, 19),
        time: "19:00",
      },
      {
        title: "Refactor dashboard cards",
        projectId: frontendProject.id,
        habitId: shippingPractice.id,
        completed: true,
        date: dayOffset(3, 10),
        dateFinish: dayOffset(3, 13),
        time: "13:00",
      },
      {
        title: "Build chart tooltip states",
        projectId: frontendProject.id,
        habitId: shippingPractice.id,
        completed: true,
        date: dayOffset(1, 11),
        dateFinish: dayOffset(1, 15),
        time: "15:00",
      },
      {
        title: "Audit mobile layout",
        projectId: frontendProject.id,
        habitId: reviewPatterns.id,
        completed: false,
        date: dayOffset(0, 16),
        time: "16:00",
      },
      {
        title: "Review 20 flashcards",
        projectId: languageProject.id,
        habitId: vocabulary.id,
        completed: true,
        date: dayOffset(4, 20),
        dateFinish: dayOffset(4, 21),
        time: "21:00",
      },
      {
        title: "Write 10 new phrases",
        projectId: languageProject.id,
        habitId: vocabulary.id,
        completed: true,
        date: dayOffset(0, 20),
        dateFinish: dayOffset(0, 21),
        time: "21:00",
      },
      {
        title: "Conversation practice",
        projectId: languageProject.id,
        completed: false,
        date: dayOffset(1, 19),
        time: "19:00",
      },
    ],
  });

  const studySubjectSeeds = [
    {
      color: "#3b82f6",
      name: "Demo - Constitutional Law",
      plannedHoursPerWeek: 5,
    },
    {
      color: "#22c55e",
      name: "Demo - Portuguese",
      plannedHoursPerWeek: 4,
    },
    {
      color: "#f97316",
      name: "Demo - Administrative Law",
      plannedHoursPerWeek: 4,
    },
  ];
  const dailyQuestionTotals = [
    [
      { correctQuestions: 92, wrongQuestions: 28 },
      { correctQuestions: 24, wrongQuestions: 6 },
      { correctQuestions: 18, wrongQuestions: 7 },
      { correctQuestions: 22, wrongQuestions: 8 },
      { correctQuestions: 16, wrongQuestions: 9 },
      { correctQuestions: 20, wrongQuestions: 10 },
      { correctQuestions: 14, wrongQuestions: 6 },
    ],
    [
      { correctQuestions: 84, wrongQuestions: 36 },
      { correctQuestions: 20, wrongQuestions: 10 },
      { correctQuestions: 17, wrongQuestions: 8 },
      { correctQuestions: 19, wrongQuestions: 11 },
      { correctQuestions: 15, wrongQuestions: 10 },
      { correctQuestions: 18, wrongQuestions: 12 },
      { correctQuestions: 13, wrongQuestions: 7 },
    ],
    [
      { correctQuestions: 78, wrongQuestions: 42 },
      { correctQuestions: 18, wrongQuestions: 12 },
      { correctQuestions: 16, wrongQuestions: 9 },
      { correctQuestions: 17, wrongQuestions: 13 },
      { correctQuestions: 14, wrongQuestions: 11 },
      { correctQuestions: 16, wrongQuestions: 14 },
      { correctQuestions: 12, wrongQuestions: 8 },
    ],
  ];

  const seedUsers = await prisma.user.findMany({
    select: { email: true, id: true },
    orderBy: { id: "asc" },
  });

  for (const seedUser of seedUsers) {
    const studySubjects = await Promise.all(
      studySubjectSeeds.map((subject) =>
        prisma.studySubject.upsert({
          where: {
            userId_name: {
              name: subject.name,
              userId: seedUser.id,
            },
          },
          create: {
            ...subject,
            notes: "Demo subject for Study Dashboard analytics.",
            userId: seedUser.id,
          },
          update: {
            color: subject.color,
            notes: "Demo subject for Study Dashboard analytics.",
            plannedHoursPerWeek: subject.plannedHoursPerWeek,
          },
        })
      )
    );

    await prisma.studyQuestionPractice.deleteMany({
      where: {
        notes: STUDY_QUESTION_SEED_NOTE,
        userId: seedUser.id,
      },
    });

    await prisma.studyQuestionPractice.createMany({
      data: studySubjects.flatMap((subject, subjectIndex) =>
        dailyQuestionTotals[subjectIndex].map((questions, daysAgo) => ({
          ...questions,
          notes: STUDY_QUESTION_SEED_NOTE,
          practiceDate: dayOffset(daysAgo, 12),
          subjectId: subject.id,
          totalQuestions:
            questions.correctQuestions + questions.wrongQuestions,
          userId: seedUser.id,
        }))
      ),
    });
  }

  const summary = await prisma.project.findMany({
    where: { userId: devUser.id, title: { in: seededTitles } },
    include: {
      habits: true,
      tasks: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(
    JSON.stringify(
      summary.map((project) => ({
        title: project.title,
        habits: project.habits.length,
        tasks: project.tasks.length,
        completedTasks: project.tasks.filter((task) => task.completed).length,
      })),
      null,
      2
    )
  );

  console.log(
    JSON.stringify(
      {
        seededQuestionPracticesPerUser:
          studySubjectSeeds.length * dailyQuestionTotals[0].length,
        seededUsers: seedUsers.map((user) => user.email),
        subjects: studySubjectSeeds.map((subject) => subject.name),
        todayQuestionsPerUser: dailyQuestionTotals.reduce(
          (total, subjectDays) =>
            total +
            subjectDays[0].correctQuestions +
            subjectDays[0].wrongQuestions,
          0
        ),
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
