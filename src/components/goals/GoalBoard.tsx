"use client";

import { CalendarClock, CheckCircle2, PauseCircle, Plus, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoal,
} from "@/hooks/useGoals";
import type { Goal, GoalStatus } from "@/types/Goal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type GoalDraft = {
  color: string;
  description: string;
  progress: number;
  status: GoalStatus;
  targetDate: string;
  title: string;
};

const emptyDraft: GoalDraft = {
  color: "#14b8a6",
  description: "",
  progress: 0,
  status: "ACTIVE",
  targetDate: "",
  title: "",
};

function dateInputValue(value?: Date | string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function GoalForm({
  goal,
  onDone,
}: {
  goal?: Goal;
  onDone?: () => void;
}) {
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const [draft, setDraft] = useState<GoalDraft>(() =>
    goal
      ? {
          color: goal.color ?? "#14b8a6",
          description: goal.description ?? "",
          progress: goal.progress,
          status: goal.status,
          targetDate: dateInputValue(goal.targetDate),
          title: goal.title,
        }
      : emptyDraft
  );

  const isSaving = createGoal.isPending || updateGoal.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      color: draft.color || null,
      description: draft.description || null,
      progress: draft.progress,
      status: draft.status,
      targetDate: draft.targetDate || null,
      title: draft.title,
    };

    if (goal) {
      await updateGoal.mutateAsync({ id: goal.id, data: payload });
    } else {
      await createGoal.mutateAsync(payload);
      setDraft(emptyDraft);
    }

    onDone?.();
  }

  return (
    <form className="grid min-w-0 gap-2" onSubmit={handleSubmit}>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
        <Input
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          placeholder="Goal title"
          required
        />
        <Input
          type="date"
          value={draft.targetDate}
          onChange={(event) =>
            setDraft((current) => ({ ...current, targetDate: event.target.value }))
          }
        />
      </div>

      <Input
        value={draft.description}
        onChange={(event) =>
          setDraft((current) => ({ ...current, description: event.target.value }))
        }
        placeholder="Description"
      />

      <div className="grid gap-2 sm:grid-cols-[7rem_1fr_8rem]">
        <Input
          type="color"
          value={draft.color}
          onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))}
          aria-label="Goal color"
        />
        <Input
          type="range"
          min={0}
          max={100}
          value={draft.progress}
          onChange={(event) =>
            setDraft((current) => ({ ...current, progress: Number(event.target.value) }))
          }
          aria-label="Goal progress"
        />
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={draft.status}
          onChange={(event) =>
            setDraft((current) => ({ ...current, status: event.target.value as GoalStatus }))
          }
        >
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-muted-foreground">{draft.progress}%</span>
        <Button type="submit" disabled={isSaving}>
          <Plus className="h-4 w-4" />
          {goal ? "Save" : "Add goal"}
        </Button>
      </div>
    </form>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const [editing, setEditing] = useState(false);

  const statusTone =
    goal.status === "COMPLETED"
      ? "text-emerald-600"
      : goal.status === "PAUSED"
        ? "text-amber-600"
        : "text-primary";

  if (editing) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-3">
          <GoalForm goal={goal} onDone={() => setEditing(false)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 border-border/70 shadow-sm">
      <CardContent className="grid gap-3 p-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: goal.color ?? "var(--primary)" }}
              />
              <h3 className="truncate font-semibold">{goal.title}</h3>
            </div>
            {goal.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {goal.description}
              </p>
            ) : null}
          </div>
          <span className={cn("shrink-0 text-xs font-semibold", statusTone)}>
            {goal.status.toLowerCase()}
          </span>
        </div>

        <div className="min-w-0">
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{goal.progress}%</span>
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "No date"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              updateGoal.mutate({
                id: goal.id,
                data: {
                  status: goal.status === "PAUSED" ? "ACTIVE" : "PAUSED",
                },
              })
            }
          >
            <PauseCircle className="h-4 w-4" />
            {goal.status === "PAUSED" ? "Resume" : "Pause"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              updateGoal.mutate({
                id: goal.id,
                data: { progress: 100, status: "COMPLETED" },
              })
            }
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete
          </Button>
          <Button size="sm" variant="outline" onClick={() => deleteGoal.mutate(goal.id)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function GoalMetrics({ goals }: { goals: Goal[] }) {
  const metrics = useMemo(() => {
    const now = new Date();
    const soon = new Date(now);
    soon.setDate(now.getDate() + 7);

    return {
      active: goals.filter((goal) => goal.status === "ACTIVE").length,
      completed: goals.filter((goal) => goal.status === "COMPLETED").length,
      average: goals.length
        ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
        : 0,
      dueSoon: goals.filter((goal) => {
        if (!goal.targetDate || goal.status === "COMPLETED") {
          return false;
        }
        const target = new Date(goal.targetDate);
        return target >= now && target <= soon;
      }).length,
    };
  }, [goals]);

  return (
    <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-border/70">
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Active goals</div>
          <div className="text-2xl font-semibold">{metrics.active}</div>
        </CardContent>
      </Card>
      <Card className="border-border/70">
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Completed goals</div>
          <div className="text-2xl font-semibold">{metrics.completed}</div>
        </CardContent>
      </Card>
      <Card className="border-border/70">
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Average progress</div>
          <div className="text-2xl font-semibold">{metrics.average}%</div>
        </CardContent>
      </Card>
      <Card className="border-border/70">
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground">Due soon</div>
          <div className="text-2xl font-semibold">{metrics.dueSoon}</div>
        </CardContent>
      </Card>
    </div>
  );
}

export function GoalBoard() {
  const { data: goals = [], isLoading } = useGoals();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <GoalMetrics goals={goals} />

      <div className="grid min-h-0 flex-1 gap-3 overflow-hidden xl:grid-cols-[minmax(18rem,0.42fr)_minmax(0,1fr)]">
        <Card className="shrink-0 border-border/70 shadow-sm xl:min-h-0">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-base">New goal</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <GoalForm />
          </CardContent>
        </Card>

        <section className="min-h-0 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="rounded-lg border border-border/70 bg-card p-4 text-sm text-muted-foreground">
              Loading goals.
            </p>
          ) : goals.length ? (
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {goals.map((goal) => (
                <GoalCard goal={goal} key={goal.id} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-border/70 bg-card p-4 text-sm text-muted-foreground">
              No goals yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
