"use client";

import { CheckCircle2, Flame, Plus, Trophy } from "lucide-react";
import { useState, type ReactNode } from "react";

import { DashboardViewport } from "@/components/dashboard-viewport";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitDetailsDialog } from "@/components/habits/habit-details-dialog";
import { HabitDialog } from "@/components/habits/habit-dialog";
import { MenuPageHeader } from "@/components/menu-page-header";
import { EmptyState, ErrorState, LoadingState, RetryButton } from "@/components/ui/app-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  useDeleteLifeHabit,
  useLifeHabitAction,
  useLifeHabits,
} from "@/hooks/useLifeHabitMutations";
import { getHabitMetrics, getTodayKey } from "@/lib/life-habits";
import type { LifeHabit, LifeHabitKind } from "@/types/BaseInterfaces";

type HabitTab = "today" | LifeHabitKind;
type Confirmation = { habit: LifeHabit; type: "delete" | "relapse" } | null;

export default function LifeHabitsPage() {
  const todayKey = getTodayKey();
  const { data: habits = [], isError, isLoading, refetch } = useLifeHabits();
  const trackHabit = useLifeHabitAction();
  const deleteHabit = useDeleteLifeHabit();
  const [activeTab, setActiveTab] = useState<HabitTab>("today");
  const [editor, setEditor] = useState<{ habit: LifeHabit | null; initialKind: LifeHabitKind } | null>(null);
  const [detailsHabitId, setDetailsHabitId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);

  const items = habits.map((habit) => ({ habit, metrics: getHabitMetrics(habit, todayKey) }));
  const visibleItems = activeTab === "today"
    ? [...items].sort((a, b) => Number(a.metrics.checkedToday) - Number(b.metrics.checkedToday))
    : items.filter(({ habit }) => habit.kind === activeTab);
  const completedToday = items.filter(({ metrics }) => metrics.checkedToday).length;
  const largestCurrentStreak = items.reduce((largest, { metrics }) => Math.max(largest, metrics.currentStreak), 0);
  const bestRecord = items.reduce((largest, { metrics }) => Math.max(largest, metrics.bestStreak), 0);
  const allDone = items.length > 0 && completedToday === items.length;
  const detailsItem = items.find(({ habit }) => habit.id === detailsHabitId) ?? null;

  function openCreate(initialKind: LifeHabitKind = activeTab === "bad" ? "bad" : "good") {
    setEditor({ habit: null, initialKind });
  }

  function openEdit(habit: LifeHabit) {
    setDetailsHabitId(null);
    setEditor({ habit, initialKind: habit.kind });
  }

  function handleConfirmation() {
    if (!confirmation) return;
    if (confirmation.type === "delete") {
      deleteHabit.mutate(confirmation.habit.id, {
        onSuccess: () => {
          if (detailsHabitId === confirmation.habit.id) setDetailsHabitId(null);
          setConfirmation(null);
        },
      });
      return;
    }
    trackHabit.mutate(
      { data: { action: "reset-bad", dayKey: todayKey }, id: confirmation.habit.id },
      { onSuccess: () => setConfirmation(null) },
    );
  }

  return (
    <DashboardViewport
      contentClassName="flex flex-col overflow-hidden pb-4"
      header={
        <MenuPageHeader
          action={<Button onClick={() => openCreate()} type="button"><Plus className="size-4" />Novo hábito</Button>}
          eyebrow="Construa consistência, um dia de cada vez."
          title="Hábitos"
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <section className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3" aria-label="Resumo dos hábitos">
          <SummaryMetric icon={<CheckCircle2 className="size-4" />} label="Hoje" primary value={`${completedToday}/${items.length}`} />
          <SummaryMetric icon={<Flame className="size-4" />} label="Maior streak atual" value={`${largestCurrentStreak}d`} />
          <SummaryMetric icon={<Trophy className="size-4" />} label="Recorde" value={`${bestRecord}d`} />
        </section>

        <div className="flex shrink-0 items-center justify-between gap-3">
          <SegmentedControl
            aria-label="Filtrar hábitos"
            onValueChange={setActiveTab}
            options={[
              { label: "Hoje", value: "today" },
              { label: "Construir", value: "good" },
              { label: "Evitar", value: "bad" },
            ]}
            value={activeTab}
          />
          <span className="hidden text-xs text-text-tertiary sm:block">{visibleItems.length} hábito{visibleItems.length === 1 ? "" : "s"}</span>
        </div>

        <section className="min-h-0 flex-1 overflow-y-auto pr-1" aria-label="Lista de hábitos">
          {isLoading ? (
            <LoadingState className="h-full" title="Carregando hábitos" />
          ) : isError ? (
            <ErrorState
              action={<RetryButton onClick={() => refetch()} />}
              className="h-full"
              description="Verifique a conexão e tente novamente."
              title="Não foi possível carregar seus hábitos."
            />
          ) : visibleItems.length ? (
            <div className="space-y-3">
              {activeTab === "today" && allDone ? (
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><CheckCircle2 className="size-4" /></span>
                  <div><p className="font-semibold">Tudo feito por hoje</p><p className="text-xs text-text-secondary">Seus registros continuam disponíveis abaixo caso queira revisá-los.</p></div>
                </div>
              ) : null}
              <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {visibleItems.map(({ habit, metrics }) => (
                  <HabitCard
                    habit={habit}
                    isPending={trackHabit.isPending && trackHabit.variables?.id === habit.id}
                    key={habit.id}
                    metrics={metrics}
                    onDelete={() => setConfirmation({ habit, type: "delete" })}
                    onDetails={() => setDetailsHabitId(habit.id)}
                    onEdit={() => openEdit(habit)}
                    onRelapse={() => setConfirmation({ habit, type: "relapse" })}
                    onToggleToday={() => trackHabit.mutate({ data: { action: "toggle-checkin", dayKey: todayKey }, id: habit.id })}
                    todayKey={todayKey}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              action={<Button onClick={() => openCreate(activeTab === "bad" ? "bad" : "good")} size="sm" type="button"><Plus className="size-4" />{activeTab === "good" ? "Criar primeiro hábito" : "Adicionar hábito"}</Button>}
              className="h-full"
              description={activeTab === "bad" ? "Adicione algo que deseja deixar de fazer e acompanhe sua nova sequência." : activeTab === "good" ? "Crie uma rotina simples para começar a construir consistência." : "Crie um hábito para ter sua lista diária sempre à mão."}
              title={activeTab === "bad" ? "Nenhum hábito sendo evitado." : activeTab === "good" ? "Nenhum hábito para construir ainda." : "Sua rotina diária está vazia."}
            />
          )}
        </section>
      </div>

      {editor ? <HabitDialog habit={editor.habit} initialKind={editor.initialKind} onOpenChange={(open) => { if (!open) setEditor(null); }} /> : null}
      {detailsItem ? (
        <HabitDetailsDialog
          habit={detailsItem.habit}
          metrics={detailsItem.metrics}
          onEdit={() => openEdit(detailsItem.habit)}
          onOpenChange={(open) => { if (!open) setDetailsHabitId(null); }}
          todayKey={todayKey}
        />
      ) : null}
      <ConfirmDialog
        confirmLabel={confirmation?.type === "relapse" ? "Registrar recaída" : "Excluir hábito"}
        description={confirmation?.type === "relapse"
          ? "A sequência atual será encerrada, mas seu recorde e histórico serão preservados. Você pode começar novamente hoje."
          : confirmation ? `O hábito “${confirmation.habit.title}” e seu histórico serão removidos permanentemente.` : "Este hábito será removido permanentemente."}
        isPending={deleteHabit.isPending || trackHabit.isPending}
        onConfirm={handleConfirmation}
        onOpenChange={(open) => { if (!open) setConfirmation(null); }}
        open={Boolean(confirmation)}
        title={confirmation?.type === "relapse" ? "Registrar recaída hoje?" : "Excluir hábito?"}
      />
    </DashboardViewport>
  );
}

function SummaryMetric({ icon, label, primary = false, value }: { icon: ReactNode; label: string; primary?: boolean; value: string }) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-center gap-2 p-3 sm:gap-3 sm:p-4">
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg sm:size-9 ${primary ? "bg-primary/10 text-primary" : "bg-secondary text-text-secondary"}`}>{icon}</span>
        <div className="min-w-0"><p className="text-lg font-bold leading-none sm:text-xl">{value}</p><p className="mt-1 truncate text-[10px] text-text-secondary sm:text-xs">{label}</p></div>
      </CardContent>
    </Card>
  );
}
