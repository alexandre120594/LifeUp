
import { PrismaClient } from '@/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
    prisma?: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const cachedPrisma = globalForPrisma.prisma;
const hasCurrentDelegates =
  cachedPrisma &&
  "financialCategory" in cachedPrisma &&
  "savingsContribution" in cachedPrisma &&
  "studyReview" in cachedPrisma;

const prisma: PrismaClient = hasCurrentDelegates ? cachedPrisma : new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
