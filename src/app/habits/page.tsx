"use client";

import { useRouter } from "next/navigation";
import { Repeat, Flame, ListChecks } from "lucide-react";
import Counter from "@/components/counter-with-icon";
import { ListSection } from "@/components/list-section";
import { PageHero } from "@/components/page-hero";
import InputHabit from "./components/InputHabit";
import { HabitList } from "./components/HabitList";
import { ChartRadialText } from "@/components/ChartsComponent/RadialChart";
import {
  ActivityTrendChart,
  HabitPerformanceChart,
} from "@/components/ChartsComponent/InsightsCharts";
import type { ChartConfig } from "@/components/ui/chart";
import { useHabit } from "@/hooks/useHabitMutations";
import { useTask } from "@/hooks/useTaskMutation";
import {
  buildActivityTrend,
  buildHabitPerformance,
  getTaskSummary,
} from "@/lib/analytics";

const radialChartConfig = {
  data: {
    label: "Completed Tasks",
  },
  progress: {
    label: "Progress",
    color: "var(--primary-yevox)",
  },
} satisfies ChartConfig;

export default function HabitsPage() {
  const router = useRouter();
  const { data: habits, isLoading } = useHabit();
  const { data: tasks } = useTask();

  const habitPerformance = buildHabitPerformance(habits ?? [], tasks ?? []);
  const activityTrend = buildActivityTrend(tasks ?? [], habits ?? []);
  const habitTaskSummary = getTaskSummary(
    (tasks ?? []).filter((task) => Boolean(task.habitId))
  );
  const totalCheckIns = (habits ?? []).reduce(
    (total, habit) => total + (habit.history?.length ?? 0),
    0
  );
  const highestStreak = Math.max(0, ...(habits ?? []).map((habit) => habit.streak ?? 0));

  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <PageHero
          badgeIcon={Repeat}
          badgeLabel="Habit center"
          title="Habit navigation and performance"
          description="Review streaks, recent check-ins, and linked task output before opening a habit detail page."
          stats={[
            { label: "Total Check-ins", value: totalCheckIns },
            { label: "Best Streak", value: highestStreak },
          ]}
        />

        <InputHabit />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Counter icon={<Repeat />} number={habits?.length} name="Habits" />
        <Counter icon={<Flame />} number={highestStreak} name="Top Streak" />
        <Counter
          icon={<ListChecks />}
          number={habitTaskSummary.completed}
          name="Completed Habit Tasks"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <HabitPerformanceChart
          title="Habit Performance"
          description="Completed tasks and recent check-ins per habit"
          data={habitPerformance}
        />
        <ChartRadialText
          title="Habit-linked task completion"
          description="Completed tasks attached to habits"
          type="completed"
          chartConfig={radialChartConfig}
          chartData={[
            {
              bucket: "progress",
              data: habitTaskSummary.completed,
              fill: "var(--color-progress)",
            },
          ]}
          tamanho={habitTaskSummary.total}
        >
          <div className="text-center text-sm text-muted-foreground">
            {habitTaskSummary.pending} habit tasks still open
          </div>
        </ChartRadialText>
      </section>

      <ActivityTrendChart
        title="Habit Activity Trend"
        description="Recent habit check-ins compared with completed tasks"
        data={activityTrend}
      />

      <ListSection
        title="All Habits"
        isLoading={isLoading}
        isEmpty={!habits?.length}
        loadingLabel="Loading habits..."
        emptyLabel="No habits found yet. Add the first one above."
      >
        <HabitList
          habits={habits}
          onHabitClick={(id) => router.push(`/habits/${id}`)}
        />
      </ListSection>
    </div>
  );
}
