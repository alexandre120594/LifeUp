import type { FinanceRecordType } from "@/types/BaseInterfaces";

export const DEFAULT_FINANCE_CATEGORIES: Array<{
  name: string;
  type: FinanceRecordType;
  color: string;
}> = [
  { name: "Salary", type: "income", color: "#16a34a" },
  { name: "Freelance", type: "income", color: "#0f766e" },
  { name: "Housing", type: "expense", color: "#f97316" },
  { name: "Food", type: "expense", color: "#eab308" },
  { name: "Transport", type: "expense", color: "#2563eb" },
  { name: "Subscriptions", type: "expense", color: "#7c3aed" },
  { name: "Health", type: "expense", color: "#dc2626" },
  { name: "Savings", type: "expense", color: "#0891b2" },
];
