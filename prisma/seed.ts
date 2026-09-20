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

const STUDY_QUESTION_SEED_NOTE = "LifeUp demo question analytics";

async function main() {
  const devUser =
    (await prisma.user.findUnique({ where: { id: 1 } })) ??
    (await prisma.user.create({
      data: {
        id: 1,
        email: "dev@lifeup.local",
        name: "LifeUp Dev",
      },
    }));

  const goalTitles = ["Health Reset", "Frontend Mastery", "Language Sprint"];

  await prisma.goal.deleteMany({
    where: {
      title: { in: goalTitles },
      userId: devUser.id,
    },
  });

  await prisma.goal.createMany({
    data: [
      {
        color: "#22c55e",
        description: "Rebuild energy, sleep, and daily health rhythm.",
        progress: 62,
        status: "ACTIVE",
        targetDate: dayOffset(-21, 9),
        title: "Health Reset",
        userId: devUser.id,
      },
      {
        color: "#3b82f6",
        description: "Polish front-end architecture and ship consistently.",
        progress: 78,
        status: "ACTIVE",
        targetDate: dayOffset(-35, 9),
        title: "Frontend Mastery",
        userId: devUser.id,
      },
      {
        color: "#f97316",
        description: "Improve vocabulary and speaking confidence.",
        progress: 100,
        status: "COMPLETED",
        targetDate: dayOffset(2, 9),
        title: "Language Sprint",
        userId: devUser.id,
      },
    ],
  });

  const studySubjectSeeds = [
    { color: "#3b82f6", name: "Demo - Constitutional Law", plannedHoursPerWeek: 5 },
    { color: "#22c55e", name: "Demo - Portuguese", plannedHoursPerWeek: 4 },
    { color: "#f97316", name: "Demo - Administrative Law", plannedHoursPerWeek: 4 },
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
          totalQuestions: questions.correctQuestions + questions.wrongQuestions,
          userId: seedUser.id,
        }))
      ),
    });
  }

  const goals = await prisma.goal.findMany({
    where: { title: { in: goalTitles }, userId: devUser.id },
    orderBy: { createdAt: "asc" },
  });

  console.log(JSON.stringify({ goals }, null, 2));
  console.log(
    JSON.stringify(
      {
        seededQuestionPracticesPerUser: studySubjectSeeds.length * dailyQuestionTotals[0].length,
        seededUsers: seedUsers.map((user) => user.email),
        subjects: studySubjectSeeds.map((subject) => subject.name),
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
