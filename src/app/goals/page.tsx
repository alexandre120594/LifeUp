import { GoalBoard } from "@/components/goals/GoalBoard";

export default function GoalsPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-3 md:p-4">
      <GoalBoard />
    </div>
  );
}
