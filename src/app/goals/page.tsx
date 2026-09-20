import { GoalBoard } from "@/components/goals/GoalBoard";
import { MenuPageHeader } from "@/components/menu-page-header";

export default function GoalsPage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3 md:p-4">
      <div className="shrink-0">
        <MenuPageHeader eyebrow="LifeUp" title="Goals" />
      </div>
      <GoalBoard />
    </div>
  );
}
