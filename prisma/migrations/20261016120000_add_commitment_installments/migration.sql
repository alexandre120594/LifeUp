ALTER TABLE "FinancialCommitment"
ADD COLUMN "installmentGroupId" TEXT,
ADD COLUMN "installmentNumber" INTEGER,
ADD COLUMN "installmentCount" INTEGER,
ADD COLUMN "plannedPurchaseId" TEXT;

UPDATE "FinancialCommitment" AS commitment
SET "plannedPurchaseId" = purchase."id"
FROM "PlannedPurchase" AS purchase
WHERE purchase."financialCommitmentId" = commitment."id";

ALTER TABLE "PlannedPurchase"
DROP CONSTRAINT "PlannedPurchase_financialCommitmentId_fkey";

DROP INDEX "PlannedPurchase_financialCommitmentId_key";

ALTER TABLE "PlannedPurchase"
DROP COLUMN "financialCommitmentId";

CREATE INDEX "FinancialCommitment_userId_installmentGroupId_idx"
ON "FinancialCommitment"("userId", "installmentGroupId");

CREATE INDEX "FinancialCommitment_userId_plannedPurchaseId_idx"
ON "FinancialCommitment"("userId", "plannedPurchaseId");

ALTER TABLE "FinancialCommitment"
ADD CONSTRAINT "FinancialCommitment_plannedPurchaseId_fkey"
FOREIGN KEY ("plannedPurchaseId") REFERENCES "PlannedPurchase"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
