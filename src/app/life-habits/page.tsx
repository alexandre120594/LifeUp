"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  CheckCircle2,
  Flame,
  Leaf,
  Pencil,
  Plus,
  RotateCcw,
  ShieldAlert,
  Trash,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useCreateLifeHabit,
  useDeleteLifeHabit,
  useLifeHabitAction,
  useLifeHabits,
  useUpdateLifeHabit,
} from "@/hooks/useLifeHabitMutations";
import { cn } from "@/lib/utils";
import type { LifeHabit, LifeHabitKind } from "@/types/BaseInterfaces";

type HabitFormState = {
  color: string;
  kind: LifeHabitKind;
  notes: string;
  title: string;
};

const defaultForm: HabitFormState = {
  color: "#16a34a",
  kind: "good",
  notes: "",
  title: "",
};

const kindOptions: Array<{
  color: string;
  description: string;
  kind: LifeHabitKind;
  label: string;
}> = [
  {
    color: "#16a34a",
    description: "Daily checkout",
    kind: "good",
    label: "Good",
  },
  {
    color: "#dc2626",
    description: "Counts days clean",
    kind: "bad",
    label: "Bad",
  },
];

function getTodayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDaysSince(value: Date | string | null | undefined) {
  if (!value) {
    return 0;
  }

  const start = new Date(value);

  if (Number.isNaN(start.getTime())) {
    return 0;
  }

  const today = new Date();
  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return Math.max(
    0,
    Math.floor((todayDay.getTime() - startDay.getTime()) / 86400000)
  );
}

function getGoodStreak(checkins: string[], todayKey: string) {
  const checkinSet = new Set(checkins);
  let streak = 0;
  const cursor = new Date(`${todayKey}T00:00:00`);

  while (checkinSet.has(getDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

function getFormFromHabit(habit: LifeHabit): HabitFormState {
  return {
    color: habit.color ?? (habit.kind === "good" ? "#16a34a" : "#dc2626"),
    kind: habit.kind,
    notes: habit.notes ?? "",
    title: habit.title,
  };
}

export default function LifeHabitsPage() {
  "use no memo";

  const todayKey = getTodayKey();
  const { data: habits = [], isLoading } = useLifeHabits();
  const createHabit = useCreateLifeHabit();
  const updateHabit = useUpdateLifeHabit();
  const deleteHabit = useDeleteLifeHabit();
  const trackHabit = useLifeHabitAction();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<LifeHabit | null>(null);
  const [form, setForm] = useState<HabitFormState>(defaultForm);

  const goodHabits = useMemo(
    () => habits.filter((habit) => habit.kind === "good"),
    [habits]
  );
  const badHabits = useMemo(
    () => habits.filter((habit) => habit.kind === "bad"),
    [habits]
  );
  const checkedToday = goodHabits.filter((habit) =>
    habit.checkins.includes(todayKey)
  ).length;
  const bestBadStreak = badHabits.reduce(
    (best, habit) =>
      Math.max(best, getDaysSince(habit.lastBadAt ?? habit.createdAt)),
    0
  );

  const weeklyGoodCheckins = useMemo(() => {
    const weekKeys = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      return getDayKey(date);
    });

    return goodHabits.reduce(
      (total, habit) =>
        total +
        habit.checkins.filter((dayKey) => weekKeys.includes(dayKey)).length,
      0
    );
  }, [goodHabits]);

  const openCreateDialog = (kind: LifeHabitKind = "good") => {
    setEditingHabit(null);
    setForm({
      ...defaultForm,
      color: kind === "good" ? "#16a34a" : "#dc2626",
      kind,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (habit: LifeHabit) => {
    setEditingHabit(habit);
    setForm(getFormFromHabit(habit));
    setIsDialogOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    const payload = {
      color: form.color,
      kind: form.kind,
      notes: form.notes.trim() || null,
      title: form.title.trim(),
    };

    if (editingHabit) {
      await updateHabit.mutateAsync({ data: payload, id: editingHabit.id });
    } else {
      await createHabit.mutateAsync(payload);
    }

    setIsDialogOpen(false);
    setEditingHabit(null);
    setForm(defaultForm);
  };

  const handleDelete = async (habit: LifeHabit) => {
    const confirmed = window.confirm(`Delete ${habit.title}?`);

    if (!confirmed) {
      return;
    }

    await deleteHabit.mutateAsync(habit.id);
  };

  const isSaving = createHabit.isPending || updateHabit.isPending;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <PageHero
        badgeIcon={Leaf}
        badgeLabel="Life planning"
        compact
        title="Habit Tracker"
        description="Track good habits with a daily checkout and bad habits with an automatic days-clean counter."
        stats={[
          { label: "Good checked", value: `${checkedToday}/${goodHabits.length}` },
          { label: "Bad counters", value: badHabits.length },
          { label: "Best clean run", value: `${bestBadStreak}d` },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.38fr)]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="border-b border-border/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex min-w-0 items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="truncate">Good habits</span>
              </CardTitle>
              <Button onClick={() => openCreateDialog("good")} type="button">
                <Plus className="h-4 w-4" />
                Add good
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-4">
            {isLoading ? (
              <EmptyState text="Loading habits..." />
            ) : goodHabits.length ? (
              goodHabits.map((habit) => (
                <GoodHabitCard
                  habit={habit}
                  key={habit.id}
                  onDelete={handleDelete}
                  onEdit={openEditDialog}
                  onToggle={() =>
                    trackHabit.mutate({
                      data: { action: "toggle-checkin", dayKey: todayKey },
                      id: habit.id,
                    })
                  }
                  todayKey={todayKey}
                />
              ))
            ) : (
              <EmptyState text="Add a good habit to start checking out today." />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <SummaryCard
            label="Today"
            title={`${checkedToday}/${goodHabits.length}`}
            tone="good"
            value="Good habits done"
          />
          <SummaryCard
            label="Last 7 days"
            title={String(weeklyGoodCheckins)}
            tone="neutral"
            value="Good checkouts"
          />
          <SummaryCard
            label="Best"
            title={`${bestBadStreak} days`}
            tone="bad"
            value="Without bad habit"
          />
        </div>
      </section>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="border-b border-border/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex min-w-0 items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <span className="truncate">Bad habits</span>
            </CardTitle>
            <Button
              onClick={() => openCreateDialog("bad")}
              type="button"
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
              Add bad
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <EmptyState text="Loading habits..." />
          ) : badHabits.length ? (
            badHabits.map((habit) => (
              <BadHabitCard
                habit={habit}
                key={habit.id}
                onDelete={handleDelete}
                onEdit={openEditDialog}
                onReset={() =>
                  trackHabit.mutate({
                    data: { action: "reset-bad", dayKey: todayKey },
                    id: habit.id,
                  })
                }
              />
            ))
          ) : (
            <EmptyState text="Add a bad habit to count days since the last slip." />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingHabit(null);
            setForm(defaultForm);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingHabit ? "Edit habit" : "Add habit"}
            </DialogTitle>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-2">
              {kindOptions.map((option) => (
                <button
                  className={cn(
                    "min-w-0 rounded-lg border p-3 text-left transition-colors",
                    form.kind === option.kind
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-secondary/50"
                  )}
                  key={option.kind}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      color: option.color,
                      kind: option.kind,
                    }))
                  }
                  type="button"
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
            <Input
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Habit name"
              value={form.title}
            />
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
              <Input
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Notes"
                value={form.notes}
              />
              <Input
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    color: event.target.value,
                  }))
                }
                type="color"
                value={form.color}
              />
            </div>
            <DialogFooter>
              <Button disabled={!form.title.trim() || isSaving} type="submit">
                {editingHabit ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingHabit ? "Update" : "Add habit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoodHabitCard({
  habit,
  onDelete,
  onEdit,
  onToggle,
  todayKey,
}: {
  habit: LifeHabit;
  onDelete: (habit: LifeHabit) => void;
  onEdit: (habit: LifeHabit) => void;
  onToggle: () => void;
  todayKey: string;
}) {
  const checked = habit.checkins.includes(todayKey);
  const streak = getGoodStreak(habit.checkins, todayKey);

  return (
    <div className="grid min-w-0 gap-3 rounded-lg border border-border/70 bg-background p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <button
        aria-label={checked ? "Undo checkout" : "Check out habit"}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-white transition-transform active:scale-95",
          checked ? "border-transparent" : "border-border bg-secondary text-muted-foreground"
        )}
        onClick={onToggle}
        style={{ backgroundColor: checked ? habit.color ?? "#16a34a" : undefined }}
        type="button"
      >
        <CheckCircle2 className="h-6 w-6" />
      </button>
      <div className="min-w-0">
        <div className="truncate font-semibold">{habit.title}</div>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant={checked ? "default" : "outline"}>
            {checked ? "Done today" : "Open today"}
          </Badge>
          <Badge variant="outline">{streak} day streak</Badge>
          <Badge variant="outline">{habit.checkins.length} total</Badge>
        </div>
        {habit.notes ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {habit.notes}
          </p>
        ) : null}
      </div>
      <HabitActions
        habit={habit}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </div>
  );
}

function BadHabitCard({
  habit,
  onDelete,
  onEdit,
  onReset,
}: {
  habit: LifeHabit;
  onDelete: (habit: LifeHabit) => void;
  onEdit: (habit: LifeHabit) => void;
  onReset: () => void;
}) {
  const daysClean = getDaysSince(habit.lastBadAt ?? habit.createdAt);

  return (
    <div className="grid min-w-0 gap-4 rounded-lg border border-border/70 bg-background p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold">{habit.title}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Last reset: {formatDate(habit.lastBadAt ?? habit.createdAt)}
          </div>
        </div>
        <HabitActions habit={habit} onDelete={onDelete} onEdit={onEdit} />
      </div>
      <div className="rounded-lg bg-red-500/10 p-4">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-semibold tracking-tight">
            {daysClean}
          </span>
          <span className="pb-1 text-sm text-muted-foreground">days clean</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-red-600"
            style={{ width: `${Math.min(daysClean * 8 + 8, 100)}%` }}
          />
        </div>
      </div>
      {habit.notes ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">{habit.notes}</p>
      ) : null}
      <Button className="w-full gap-2" onClick={onReset} type="button" variant="destructive">
        <RotateCcw className="h-4 w-4" />
        I did it
      </Button>
      <div className="text-xs text-muted-foreground">
        {habit.badEvents.length} reset{habit.badEvents.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function HabitActions({
  habit,
  onDelete,
  onEdit,
}: {
  habit: LifeHabit;
  onDelete: (habit: LifeHabit) => void;
  onEdit: (habit: LifeHabit) => void;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button
        aria-label={`Edit ${habit.title}`}
        className="h-8 w-8"
        onClick={() => onEdit(habit)}
        size="icon"
        type="button"
        variant="outline"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        aria-label={`Delete ${habit.title}`}
        className="h-8 w-8"
        onClick={() => onDelete(habit)}
        size="icon"
        type="button"
        variant="outline"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SummaryCard({
  label,
  title,
  tone,
  value,
}: {
  label: string;
  title: string;
  tone: "bad" | "good" | "neutral";
  value: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        tone === "good" && "border-emerald-500/30 bg-emerald-500/10",
        tone === "bad" && "border-red-500/30 bg-red-500/10",
        tone === "neutral" && "border-border/70 bg-card"
      )}
    >
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-center gap-2">
        {tone === "good" ? <Leaf className="h-5 w-5 text-emerald-600" /> : null}
        {tone === "bad" ? <Flame className="h-5 w-5 text-red-600" /> : null}
        <div className="text-2xl font-semibold">{title}</div>
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/70 bg-secondary/25 p-4 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
