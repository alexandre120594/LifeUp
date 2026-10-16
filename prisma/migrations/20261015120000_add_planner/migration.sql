-- CreateTable
CREATE TABLE "PlannerTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "goalId" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlannerTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedPurchase" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "estimatedAmount" DECIMAL(12,2),
    "plannedDate" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "necessity" TEXT NOT NULL DEFAULT 'want',
    "status" TEXT NOT NULL DEFAULT 'idea',
    "goalId" TEXT,
    "financialCommitmentId" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlannedPurchase_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlannedPurchase_financialCommitmentId_key" ON "PlannedPurchase"("financialCommitmentId");
CREATE INDEX "PlannerTask_userId_status_dueDate_idx" ON "PlannerTask"("userId", "status", "dueDate");
CREATE INDEX "PlannerTask_userId_goalId_idx" ON "PlannerTask"("userId", "goalId");
CREATE INDEX "PlannedPurchase_userId_status_plannedDate_idx" ON "PlannedPurchase"("userId", "status", "plannedDate");
CREATE INDEX "PlannedPurchase_userId_goalId_idx" ON "PlannedPurchase"("userId", "goalId");

ALTER TABLE "PlannerTask" ADD CONSTRAINT "PlannerTask_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlannerTask" ADD CONSTRAINT "PlannerTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlannedPurchase" ADD CONSTRAINT "PlannedPurchase_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlannedPurchase" ADD CONSTRAINT "PlannedPurchase_financialCommitmentId_fkey" FOREIGN KEY ("financialCommitmentId") REFERENCES "FinancialCommitment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlannedPurchase" ADD CONSTRAINT "PlannedPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
