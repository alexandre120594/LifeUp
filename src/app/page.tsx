"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, ClipboardList, Plus, Target } from "lucide-react";
import { CurrentUserName } from "@/components/current-user-name";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { FocusCard, GoalCard, StatCard } from "@/components/productivity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoals } from "@/hooks/useGoals";
import type { Goal, GoalArea } from "@/types/Goal";

const areaLabels: Record<GoalArea, string> = {
  BODY: "Corpo",
  MIND: "Mente",
  HOME: "Casa",
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function getDueLabel(goal: Goal) {
  if (!goal.targetDate) {
    return "Sem prazo";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(goal.targetDate);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) {
    return `Atrasada desde ${formatDate(goal.targetDate)}`;
  }

  if (diffDays === 0) {
    return "Vence hoje";
  }

  if (diffDays <= 7) {
    return `Vence em ${diffDays} dia${diffDays === 1 ? "" : "s"}`;
  }

  return `Prazo ${formatDate(goal.targetDate)}`;
}

function TodayGoalCard({ goal, priority }: { goal: Goal; priority?: boolean }) {
  return (
    <GoalCard
      badge={<Badge variant={goal.status === "PAUSED" ? "outline" : "secondary"}>{goal.status === "PAUSED" ? "Pausada" : "Ativa"}</Badge>}
      className={priority ? "bg-panel-elevated shadow-snow-2" : undefined}
      color={goal.color}
      footer={getDueLabel(goal)}
      meta={areaLabels[goal.area]}
      progress={goal.progress}
      title={goal.title}
    />
  );
}

export default function DashboardPage() {
  const { data: goals = [], isError, isLoading, refetch } = useGoals();
  const activeGoals = goals.filter((goal) => goal.status === "ACTIVE");
  const completedGoals = goals.filter((goal) => goal.status === "COMPLETED");
  const averageProgress = goals.length
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
    : 0;
  const upcomingGoals = activeGoals
    .filter((goal) => goal.targetDate)
    .sort((a, b) => new Date(a.targetDate ?? 0).getTime() - new Date(b.targetDate ?? 0).getTime())
    .slice(0, 4);
  const nextGoals = upcomingGoals.length
    ? upcomingGoals
    : activeGoals.sort((a, b) => b.progress - a.progress).slice(0, 4);

  return (
    <DashboardViewport
      header={
        <MenuPageHeader
          eyebrow="Bem-vindo de volta"
          title={<CurrentUserName />}
          action={
            <Button asChild size="sm">
              <Link href="/goals">
                <Plus className="size-4" />
                Nova meta
              </Link>
            </Button>
          }
        />
      }
    >
      <div className="grid gap-3">
        <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Target} label="Metas ativas" value={String(activeGoals.length)} />
          <StatCard icon={CheckCircle2} label="Concluidas" value={String(completedGoals.length)} />
          <StatCard icon={ClipboardList} label="Progresso medio" value={`${averageProgress}%`} />
          <StatCard icon={CalendarClock} label="Com prazo" value={String(upcomingGoals.length)} />
        </section>

        <div className="grid min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.38fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-base">Proxima acao</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 p-3 pt-0">
              {isLoading ? (
                <p className="rounded-md border border-dashed border-border/80 p-3 text-sm text-text-secondary">
                  Carregando metas.
                </p>
              ) : isError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                  <p className="text-sm font-medium text-destructive">Nao foi possivel carregar suas metas.</p>
                  <Button className="mt-2" size="sm" variant="outline" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </div>
              ) : nextGoals.length ? (
                nextGoals.map((goal, index) => (
                  <TodayGoalCard goal={goal} key={goal.id} priority={index === 0} />
                ))
              ) : (
                <div className="rounded-md border border-dashed border-border/80 p-4">
                  <p className="font-medium">Nenhuma meta ativa por enquanto.</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Crie uma meta simples para Corpo, Mente ou Casa e ela aparece aqui.
                  </p>
                  <Button asChild className="mt-3" size="sm">
                    <Link href="/goals">
                      Criar primeira meta
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid content-start gap-3">
            <FocusCard
              actions={<Button asChild size="sm" variant="secondary"><Link href="/pomodoro">Iniciar foco</Link></Button>}
              label="Proxima sessao de foco"
              meta="O timer continua ativo durante a navegacao."
              time="25:00"
            />
            <Card className="border-border shadow-none">
              <CardHeader className="p-3 pb-2"><CardTitle className="text-sm">Atalhos</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 p-3 pt-0">
                <Button asChild size="sm" variant="outline"><Link href="/inbox">Capturar ideia</Link></Button>
                <Button asChild size="sm" variant="outline"><Link href="/notes">Abrir notas</Link></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardViewport>
  );
}
