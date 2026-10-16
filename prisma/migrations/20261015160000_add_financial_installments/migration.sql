ALTER TABLE "FinancialTransaction"
ADD COLUMN "installmentGroupId" TEXT,
ADD COLUMN "installmentNumber" INTEGER,
ADD COLUMN "installmentCount" INTEGER;

CREATE INDEX "FinancialTransaction_userId_installmentGroupId_idx"
ON "FinancialTransaction"("userId", "installmentGroupId");
