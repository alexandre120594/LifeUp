"use client";

import { GoalBoard } from "@/components/goals/GoalBoard";
import { MenuPageHeader } from "@/components/menu-page-header";
import { CurrentUserName } from "@/components/current-user-name";

export default function DashboardPage() {
  return (
    <div className="flex h-dvh min-h-0 flex-col gap-3 overflow-hidden p-3 md:p-4">
      <div className="shrink-0">
        <MenuPageHeader
          eyebrow="Welcome back,"
          title={<CurrentUserName />}
        />
      </div>
      <GoalBoard />
    </div>
  );
}
