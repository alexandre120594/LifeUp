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
import { useDeleteLifeHabit, useLifeHabitAction, useLifeHabits, useUpdateLifeHabit } from "@/hooks/useLifeHabitMutations";
import { getHabitMetrics, getTodayKey, isHabitPausedOn, isHabitScheduledOn } from "@/lib/life-habits";
import type { LifeHabit, LifeHabitKind } from "@/types/BaseInterfaces";

type HabitTab = "today" | "archived" | LifeHabitKind;
type Confirmation = { habit: LifeHabit; type: "archive" | "delete" | "relapse" } | null;

export default function LifeHabitsPage() {
  const todayKey = getTodayKey();
  const [activeTab, setActiveTab] = useState<HabitTab>("today");
  const { data: habits = [], isError, isLoading, refetch } = useLifeHabits(activeTab === "archived");
  const action = useLifeHabitAction();
  const update = useUpdateLifeHabit();
  const remove = useDeleteLifeHabit();
  const [editor, setEditor] = useState<{ habit: LifeHabit | null; initialKind: LifeHabitKind } | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);

  const items = habits.map((habit) => ({ habit, metrics: getHabitMetrics(habit, todayKey) }));
  const visible = (activeTab === "today"
    ? items.filter(({ habit }) => isHabitScheduledOn(habit, todayKey) && !isHabitPausedOn(habit, todayKey))
    : activeTab === "archived" ? items : items.filter(({ habit }) => habit.kind === activeTab)
  ).sort((a, b) => Number(a.metrics.checkedToday) - Number(b.metrics.checkedToday));
  const done = visible.filter(({ metrics }) => metrics.checkedToday).length;
  const current = Math.max(0, ...items.map(({ metrics }) => metrics.currentStreak));
  const record = Math.max(0, ...items.map(({ metrics }) => metrics.bestStreak));
  const details = items.find(({ habit }) => habit.id === detailsId) ?? null;

  function confirm() {
    if (!confirmation) return;
    if (confirmation.type === "delete") remove.mutate(confirmation.habit.id, { onSuccess: () => { setDetailsId(null); setConfirmation(null); } });
    else if (confirmation.type === "archive") update.mutate({ id: confirmation.habit.id, data: { archivedAt: confirmation.habit.archivedAt ? null : new Date().toISOString() } }, { onSuccess: () => setConfirmation(null) });
    else action.mutate({ id: confirmation.habit.id, data: { action: "reset-bad", dayKey: todayKey } }, { onSuccess: () => setConfirmation(null) });
  }

  return (
    <DashboardViewport contentClassName="flex flex-col overflow-hidden pb-4" header={<MenuPageHeader action={activeTab === "archived" ? undefined : <Button onClick={() => setEditor({ habit: null, initialKind: activeTab === "negative" || activeTab === "quantitative" ? activeTab : "positive" })}><Plus className="size-4" />Novo hábito</Button>} eyebrow="Registre em um toque e acompanhe sua consistência." title="Hábitos" />}>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <section className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3" aria-label="Resumo"><Summary icon={<CheckCircle2 className="size-4" />} label="Hoje" primary value={`${done}/${visible.length}`} /><Summary icon={<Flame className="size-4" />} label="Maior sequência" value={`${current}`} /><Summary icon={<Trophy className="size-4" />} label="Recorde" value={`${record}`} /></section>
        <div className="flex shrink-0 items-center justify-between gap-3 overflow-x-auto"><SegmentedControl aria-label="Filtrar hábitos" onValueChange={setActiveTab} options={[{ label: "Hoje", value: "today" }, { label: "Normal", value: "positive" }, { label: "Evitar", value: "negative" }, { label: "Quantidade", value: "quantitative" }, { label: "Arquivados", value: "archived" }]} value={activeTab} /><span className="hidden text-xs text-text-tertiary sm:block">{visible.length} hábito{visible.length === 1 ? "" : "s"}</span></div>
        <section className="min-h-0 flex-1 overflow-y-auto pr-1">
          {isLoading ? <LoadingState className="h-full" title="Carregando hábitos" /> : isError ? <ErrorState action={<RetryButton onClick={() => refetch()} />} className="h-full" description="Verifique a conexão e tente novamente." title="Não foi possível carregar seus hábitos." /> : visible.length ? <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">{visible.map(({ habit, metrics }) => <HabitCard habit={habit} isPending={action.isPending && action.variables?.id === habit.id} key={habit.id} metrics={metrics} onAction={(data) => action.mutate({ id: habit.id, data })} onArchive={() => setConfirmation({ habit, type: "archive" })} onDelete={() => setConfirmation({ habit, type: "delete" })} onDetails={() => setDetailsId(habit.id)} onEdit={() => setEditor({ habit, initialKind: habit.kind })} onRelapse={() => setConfirmation({ habit, type: "relapse" })} todayKey={todayKey} />)}</div> : <EmptyState action={activeTab === "archived" ? undefined : <Button onClick={() => setEditor({ habit: null, initialKind: activeTab === "negative" || activeTab === "quantitative" ? activeTab : "positive" })} size="sm"><Plus className="size-4" />Criar hábito</Button>} className="h-full" description={activeTab === "archived" ? "Hábitos arquivados preservam todo o histórico e podem ser restaurados." : "Crie um hábito normal, de abstinência ou quantitativo com a agenda que fizer sentido."} title={activeTab === "archived" ? "Nenhum hábito arquivado." : "Nenhum hábito aqui ainda."} />}
        </section>
      </div>
      {editor ? <HabitDialog habit={editor.habit} initialKind={editor.initialKind} onOpenChange={(open) => { if (!open) setEditor(null); }} /> : null}
      {details ? <HabitDetailsDialog habit={details.habit} metrics={details.metrics} onEdit={() => { setDetailsId(null); setEditor({ habit: details.habit, initialKind: details.habit.kind }); }} onOpenChange={(open) => { if (!open) setDetailsId(null); }} todayKey={todayKey} /> : null}
      <ConfirmDialog confirmLabel={confirmation?.type === "delete" ? "Excluir" : confirmation?.type === "archive" ? confirmation.habit.archivedAt ? "Restaurar" : "Arquivar" : "Registrar recaída"} description={confirmation?.type === "delete" ? "O hábito e todo o histórico serão removidos permanentemente." : confirmation?.type === "archive" ? confirmation.habit.archivedAt ? "O hábito voltará à lista ativa com todo o histórico." : "O histórico será preservado e o hábito sairá da lista ativa." : "O dia será marcado como recaída e a sequência atual será encerrada."} isPending={remove.isPending || update.isPending || action.isPending} onConfirm={confirm} onOpenChange={(open) => { if (!open) setConfirmation(null); }} open={Boolean(confirmation)} title={confirmation?.type === "delete" ? "Excluir hábito?" : confirmation?.type === "archive" ? confirmation.habit.archivedAt ? "Restaurar hábito?" : "Arquivar hábito?" : "Registrar recaída hoje?"} />
    </DashboardViewport>
  );
}

function Summary({ icon, label, primary = false, value }: { icon: ReactNode; label: string; primary?: boolean; value: string }) { return <Card className="gap-0 py-0"><CardContent className="flex items-center gap-2 p-3 sm:gap-3 sm:p-4"><span className={`grid size-8 place-items-center rounded-lg ${primary ? "bg-primary/10 text-primary" : "bg-secondary text-text-secondary"}`}>{icon}</span><div><p className="text-lg font-bold leading-none sm:text-xl">{value}</p><p className="mt-1 text-[10px] text-text-secondary sm:text-xs">{label}</p></div></CardContent></Card>; }
