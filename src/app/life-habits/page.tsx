"use client";

import { type ComponentType, type FormEvent, useMemo, useState } from "react";
import {
  Award,
  CalendarCheck2,
  CheckCircle2,
  Flame,
  Medal,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Target,
  Trash,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard, StreakCard } from "@/components/productivity";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { LifeHabit } from "@/types/BaseInterfaces";

type HabitFormState = {
  color: string;
  notes: string;
  reward: string;
  rewardConfirmed: boolean;
  targetDays: string;
  title: string;
};

type HabitMetrics = {
  bestStreak: number;
  checkedToday: boolean;
  currentStreak: number;
  lastRelapseLabel: string;
  nextRewardAt: number;
  progress: number;
  rewardsUnlocked: number;
  targetDays: number;
  targetReached: boolean;
};

const defaultForm: HabitFormState = {
  color: "#0f766e",
  notes: "",
  reward: "",
  rewardConfirmed: false,
  targetDays: "30",
  title: "",
};

const fallbackRewards = [
  "Sessao de cinema",
  "Livro novo",
  "Passeio ao ar livre",
  "Equipamento de treino",
];

function getTodayKey() {
  return getDayKey(new Date());
}

function getDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPreviousDayKey(dayKey: string) {
  const date = new Date(`${dayKey}T00:00:00`);
  date.setDate(date.getDate() - 1);

  return getDayKey(date);
}

function normalizeTargetDays(value: number | null | undefined) {
  if (!value || !Number.isFinite(value)) {
    return 30;
  }

  return Math.min(Math.max(Math.round(value), 10), 365);
}

function getLastRelapseKey(habit: LifeHabit) {
  const lastEvent = habit.badEvents.at(-1);

  if (lastEvent) {
    return lastEvent;
  }

  if (!habit.lastBadAt) {
    return null;
  }

  return getDayKey(new Date(habit.lastBadAt));
}

function getEligibleCheckins(habit: LifeHabit) {
  const lastRelapseKey = getLastRelapseKey(habit);

  return [...new Set(habit.checkins)]
    .filter((dayKey) => !lastRelapseKey || dayKey > lastRelapseKey)
    .sort();
}

function getCurrentStreak(checkins: string[], todayKey: string) {
  const checkinSet = new Set(checkins);
  let cursor = checkinSet.has(todayKey) ? todayKey : getPreviousDayKey(todayKey);
  let streak = 0;

  while (checkinSet.has(cursor)) {
    streak += 1;
    cursor = getPreviousDayKey(cursor);
  }

  return streak;
}

function getBestStreak(checkins: string[]) {
  const uniqueCheckins = [...new Set(checkins)].sort();
  let best = 0;
  let current = 0;
  let previous = "";

  for (const dayKey of uniqueCheckins) {
    current =
      previous && getPreviousDayKey(dayKey) === previous ? current + 1 : 1;
    best = Math.max(best, current);
    previous = dayKey;
  }

  return best;
}

function getHabitMetrics(habit: LifeHabit, todayKey: string): HabitMetrics {
  const targetDays = normalizeTargetDays(habit.targetDays);
  const eligibleCheckins = getEligibleCheckins(habit);
  const currentStreak = getCurrentStreak(eligibleCheckins, todayKey);
  const rewardsUnlocked = Math.floor(currentStreak / 10);
  const nextRewardAt = Math.min((rewardsUnlocked + 1) * 10, targetDays);
  const lastRelapseKey = getLastRelapseKey(habit);

  return {
    bestStreak: getBestStreak(habit.checkins),
    checkedToday: eligibleCheckins.includes(todayKey),
    currentStreak,
    lastRelapseLabel: lastRelapseKey
      ? formatDayKey(lastRelapseKey)
      : "Sem recaidas",
    nextRewardAt,
    progress: Math.min((currentStreak / targetDays) * 100, 100),
    rewardsUnlocked,
    targetDays,
    targetReached: currentStreak >= targetDays,
  };
}

function formatDayKey(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

function getFormFromHabit(habit: LifeHabit): HabitFormState {
  return {
    color: habit.color ?? "#0f766e",
    notes: habit.notes ?? "",
    reward: habit.reward ?? "",
    rewardConfirmed: true,
    targetDays: String(normalizeTargetDays(habit.targetDays)),
    title: habit.title,
  };
}

function rewardLooksRisky(title: string, reward: string) {
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedReward = reward.trim().toLowerCase();

  return Boolean(
    normalizedTitle &&
      normalizedReward &&
      normalizedReward.includes(normalizedTitle)
  );
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
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [form, setForm] = useState<HabitFormState>(defaultForm);

  const quitHabits = useMemo(
    () => habits.filter((habit) => habit.kind === "bad"),
    [habits]
  );

  const habitCards = useMemo(
    () =>
      quitHabits.map((habit) => ({
        habit,
        metrics: getHabitMetrics(habit, todayKey),
      })),
    [quitHabits, todayKey]
  );

  const selectedHabit =
    habitCards.find(({ habit }) => habit.id === selectedHabitId) ??
    habitCards[0] ??
    null;

  const totalRewards = habitCards.reduce(
    (total, item) => total + item.metrics.rewardsUnlocked,
    0
  );
  const activeStreaks = habitCards.filter(
    (item) => item.metrics.currentStreak > 0
  ).length;
  const bestRecord = habitCards.reduce(
    (best, item) => Math.max(best, item.metrics.bestStreak),
    0
  );
  const checkinsToday = habitCards.filter(
    (item) => item.metrics.checkedToday
  ).length;

  const openCreateDialog = () => {
    setEditingHabit(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (habit: LifeHabit) => {
    setEditingHabit(habit);
    setForm(getFormFromHabit(habit));
    setIsDialogOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const targetDays = normalizeTargetDays(Number.parseInt(form.targetDays, 10));
    const payload = {
      color: form.color,
      kind: "bad" as const,
      notes: form.notes.trim() || null,
      reward: form.reward.trim(),
      targetDays,
      title: form.title.trim(),
    };

    if (
      !payload.title ||
      !payload.reward ||
      !form.rewardConfirmed ||
      rewardLooksRisky(payload.title, payload.reward)
    ) {
      return;
    }

    if (editingHabit) {
      await updateHabit.mutateAsync({ data: payload, id: editingHabit.id });
      setSelectedHabitId(editingHabit.id);
    } else {
      const createdHabit = await createHabit.mutateAsync(payload);
      setSelectedHabitId(createdHabit.id);
    }

    setIsDialogOpen(false);
    setEditingHabit(null);
    setForm(defaultForm);
  };

  const handleDelete = async (habit: LifeHabit) => {
    const confirmed = window.confirm(`Excluir ${habit.title}?`);

    if (!confirmed) {
      return;
    }

    await deleteHabit.mutateAsync(habit.id);

    if (selectedHabitId === habit.id) {
      setSelectedHabitId(null);
    }
  };

  const isSaving = createHabit.isPending || updateHabit.isPending;
  const rewardRisky = rewardLooksRisky(form.title, form.reward);
  const canSubmit =
    Boolean(form.title.trim()) &&
    Boolean(form.reward.trim()) &&
    form.rewardConfirmed &&
    !rewardRisky &&
    !isSaving;

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden p-3 sm:p-4 lg:p-5">
      <section className="grid min-h-0 flex-1 grid-rows-[minmax(0,0.95fr)_minmax(0,1.2fr)_minmax(0,0.85fr)] gap-3 lg:grid-cols-[minmax(19rem,0.72fr)_minmax(0,1.55fr)_minmax(17rem,0.7fr)] lg:grid-rows-none">
        <aside className="flex min-h-0 flex-col gap-3 overflow-hidden">
          <div className="rounded-lg border border-border/70 bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Badge className="gap-1" variant="outline">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Habit Tracker
                </Badge>
                <h2 className="mt-3 text-2xl font-semibold tracking-normal">
                  Abandone um habito por dia
                </h2>
              </div>
              <Button
                aria-label="Criar habito"
                className="h-10 w-10 shrink-0"
                onClick={openCreateDialog}
                size="icon"
                type="button"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Defina o habito, a meta em dias e uma recompensa saudavel. O
              check diario mantem a sequencia ativa e libera uma recompensa a
              cada 10 dias.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MetricTile
              icon={CalendarCheck2}
              label="Hoje"
              value={`${checkinsToday}/${quitHabits.length}`}
            />
            <MetricTile icon={Flame} label="Ativas" value={String(activeStreaks)} />
            <MetricTile icon={Trophy} label="Recorde" value={`${bestRecord}d`} />
            <MetricTile icon={Award} label="Recompensas" value={String(totalRewards)} />
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border/70 bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 p-3">
              <div className="text-sm font-semibold">Habitos em andamento</div>
              <Badge variant="secondary">{quitHabits.length}</Badge>
            </div>
            <div className="grid max-h-full gap-2 overflow-y-auto p-3">
              {isLoading ? (
                <EmptyState text="Carregando habitos..." />
              ) : habitCards.length ? (
                habitCards.map(({ habit, metrics }) => (
                  <button
                    className={cn(
                      "min-w-0 rounded-lg border p-3 text-left transition-colors",
                      selectedHabit?.habit.id === habit.id
                        ? "border-primary bg-primary/10"
                        : "border-border/70 bg-background hover:bg-secondary/50"
                    )}
                    key={habit.id}
                    onClick={() => setSelectedHabitId(habit.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{habit.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {metrics.currentStreak}d
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${metrics.progress}%` }}
                      />
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState text="Crie o primeiro habito que deseja abandonar." />
              )}
            </div>
          </div>
        </aside>

        <main className="min-h-0 overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
          {selectedHabit ? (
            <FocusPanel
              habit={selectedHabit.habit}
              isTracking={trackHabit.isPending}
              metrics={selectedHabit.metrics}
              onDelete={handleDelete}
              onEdit={openEditDialog}
              onRelapse={() =>
                trackHabit.mutate({
                  data: { action: "reset-bad", dayKey: todayKey },
                  id: selectedHabit.habit.id,
                })
              }
              onToggleToday={() =>
                trackHabit.mutate({
                  data: { action: "toggle-checkin", dayKey: todayKey },
                  id: selectedHabit.habit.id,
                })
              }
            />
          ) : (
            <div className="grid h-full place-items-center p-6 text-center">
              <div className="max-w-sm">
                <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">
                  Comece com um habito
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Escolha algo que deseja abandonar, defina uma meta e mantenha
                  o check diario para construir sequencia.
                </p>
                <Button className="mt-5" onClick={openCreateDialog} type="button">
                  <Plus className="h-4 w-4" />
                  Criar habito
                </Button>
              </div>
            </div>
          )}
        </main>

        <RewardPanel selectedHabit={selectedHabit} />
      </section>

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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingHabit ? "Editar plano" : "Novo habito para abandonar"}
            </DialogTitle>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
              <label className="grid gap-2 text-sm font-medium">
                Habito
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Ex.: comprar por impulso"
                  value={form.title}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Meta
                <Input
                  max={365}
                  min={10}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      targetDays: event.target.value,
                    }))
                  }
                  type="number"
                  value={form.targetDays}
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium">
              Recompensa a cada 10 dias
              <Input
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reward: event.target.value,
                  }))
                }
                placeholder={fallbackRewards[0]}
                value={form.reward}
              />
            </label>
            {rewardRisky ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                A recompensa parece repetir o habito. Escolha algo que nao
                incentive a recaida.
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
              <label className="grid gap-2 text-sm font-medium">
                Observacao
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Gatilhos, motivo, regra pessoal"
                  value={form.notes}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Cor
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
              </label>
            </div>
            <label className="flex items-start gap-3 rounded-lg border border-border/70 bg-secondary/35 p-3 text-sm">
              <Checkbox
                checked={form.rewardConfirmed}
                className="mt-0.5"
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    rewardConfirmed: checked === true,
                  }))
                }
              />
              <span>
                Confirmo que a recompensa escolhida nao envolve nem incentiva o
                habito que estou tentando abandonar.
              </span>
            </label>
            <DialogFooter>
              <Button disabled={!canSubmit} type="submit">
                {editingHabit ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingHabit ? "Salvar" : "Criar plano"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FocusPanel({
  habit,
  isTracking,
  metrics,
  onDelete,
  onEdit,
  onRelapse,
  onToggleToday,
}: {
  habit: LifeHabit;
  isTracking: boolean;
  metrics: HabitMetrics;
  onDelete: (habit: LifeHabit) => void;
  onEdit: (habit: LifeHabit) => void;
  onRelapse: () => void;
  onToggleToday: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className="border-b border-border/70 p-4 text-primary-foreground"
        style={{ backgroundColor: habit.color ?? "#0f766e" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge className="bg-white/18 text-white" variant="outline">
              Meta de {metrics.targetDays} dias
            </Badge>
            <h2 className="mt-3 truncate text-3xl font-semibold tracking-normal">
              {habit.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm text-white/85">
              {habit.notes || "Mantenha a sequencia ativa com um check por dia."}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              aria-label="Editar"
              className="h-9 w-9 bg-white/15 text-white hover:bg-white/25"
              onClick={() => onEdit(habit)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Excluir"
              className="h-9 w-9 bg-white/15 text-white hover:bg-white/25"
              onClick={() => onDelete(habit)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 xl:grid-rows-[auto_minmax(0,1fr)]">
        <div className="grid gap-3 sm:grid-cols-3">
          <StreakCard
            label="Sequencia atual"
            value={`${metrics.currentStreak} dias`}
          />
          <StatCard
            icon={Trophy}
            label="Recorde pessoal"
            value={`${metrics.bestStreak} dias`}
          />
          <StatCard
            icon={Award}
            label="Recompensas liberadas"
            value={String(metrics.rewardsUnlocked)}
          />
        </div>

        <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="rounded-lg border border-border/70 bg-background p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Progresso da meta
                </div>
                <div className="mt-1 text-4xl font-semibold tracking-normal">
                  {Math.round(metrics.progress)}%
                </div>
              </div>
              <Badge variant={metrics.targetReached ? "default" : "secondary"}>
                {metrics.currentStreak}/{metrics.targetDays} dias
              </Badge>
            </div>
            <div className="mt-5 h-4 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${metrics.progress}%` }}
              />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                className="h-14 gap-2"
                disabled={isTracking}
                onClick={onToggleToday}
                type="button"
                variant={metrics.checkedToday ? "secondary" : "default"}
              >
                <CheckCircle2 className="h-5 w-5" />
                {metrics.checkedToday ? "Check feito hoje" : "Fazer check diario"}
              </Button>
              <Button
                className="h-14 gap-2"
                disabled={isTracking}
                onClick={onRelapse}
                type="button"
                variant="destructive"
              >
                <RotateCcw className="h-5 w-5" />
                Registrar recaida
              </Button>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-border/70 bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" />
              Proximo marco
            </div>
            <div>
              <div className="text-3xl font-semibold">
                {metrics.targetReached
                  ? "Meta concluida"
                  : `${Math.max(metrics.nextRewardAt - metrics.currentStreak, 0)} dias`}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {metrics.targetReached
                  ? "A sequencia ja bateu a meta definida."
                  : `Faltam para liberar a recompensa dos ${metrics.nextRewardAt} dias.`}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/60 p-3 text-sm">
              Ultima recaida: {metrics.lastRelapseLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RewardPanel({
  selectedHabit,
}: {
  selectedHabit: { habit: LifeHabit; metrics: HabitMetrics } | null;
}) {
  const targetRewards = selectedHabit
    ? Math.ceil(selectedHabit.metrics.targetDays / 10)
    : 3;
  const rewardRows = Array.from(
    { length: Math.max(targetRewards, 1) },
    (_, index) => {
      const day = (index + 1) * 10;
      const unlocked = selectedHabit
        ? selectedHabit.metrics.currentStreak >= day
        : false;

      return { day, unlocked };
    }
  );

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
      <div className="border-b border-border/70 p-4">
        <div className="flex items-center gap-2 font-semibold">
          <Medal className="h-5 w-5 text-primary" />
          Recompensas
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          A cada 10 dias, desbloqueie a recompensa escolhida sem reforcar o
          habito abandonado.
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {selectedHabit ? (
          <div className="grid gap-3">
            <div className="rounded-lg border border-border/70 bg-background p-3">
              <div className="text-xs font-medium text-muted-foreground">
                Recompensa definida
              </div>
              <div className="mt-2 text-sm font-semibold">
                {selectedHabit.habit.reward || fallbackRewards[1]}
              </div>
            </div>
            {rewardRows.map((reward) => (
              <div
                className={cn(
                  "rounded-lg border p-3",
                  reward.unlocked
                    ? "border-primary/40 bg-primary/10"
                    : "border-border/70 bg-background"
                )}
                key={reward.day}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{reward.day} dias</div>
                  <Badge variant={reward.unlocked ? "default" : "outline"}>
                    {reward.unlocked ? "Liberada" : "Bloqueada"}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {reward.unlocked
                    ? "Voce conquistou este marco."
                    : "Mantenha os checks diarios para chegar aqui."}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Selecione ou crie um habito para ver as recompensas." />
        )}
      </div>
    </aside>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
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
