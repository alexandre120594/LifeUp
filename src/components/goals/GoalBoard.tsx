"use client";

import {
  Brain,
  CalendarClock,
  CheckCircle2,
  Dumbbell,
  Edit3,
  Home,
  ListFilter,
  PauseCircle,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoal,
} from "@/hooks/useGoals";
import type { Goal, GoalArea, GoalAreaFilter, GoalStatus, GoalStatusFilter } from "@/types/Goal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatCard } from "@/components/productivity";
import { cn } from "@/lib/utils";

type GoalDraft = {
  area: GoalArea;
  color: string;
  description: string;
  progress: number;
  status: GoalStatus;
  targetDate: string;
  title: string;
};

const colorChoices = ["#20c5bb", "#9d92ff", "#f2c261", "#ff7a8d", "#6fd49a"];

const areaMeta: Record<
  GoalArea,
  {
    Icon: LucideIcon;
    label: string;
    tone: string;
  }
> = {
  BODY: {
    Icon: Dumbbell,
    label: "Corpo",
    tone: "border-success/30 bg-success/10 text-success",
  },
  MIND: {
    Icon: Brain,
    label: "Mente",
    tone: "border-info/30 bg-info/10 text-info",
  },
  HOME: {
    Icon: Home,
    label: "Casa",
    tone: "border-warning/30 bg-warning/10 text-warning",
  },
};

const statusLabels: Record<GoalStatus, string> = {
  ACTIVE: "Ativa",
  PAUSED: "Pausada",
  COMPLETED: "Concluida",
};

const statusTone: Record<GoalStatus, string> = {
  ACTIVE: "border-primary/30 bg-primary/10 text-primary",
  PAUSED: "border-warning/30 bg-warning/10 text-warning",
  COMPLETED: "border-success/30 bg-success/10 text-success",
};

const areaOrder: GoalArea[] = ["BODY", "MIND", "HOME"];
const areaFilters: GoalAreaFilter[] = ["ALL", ...areaOrder];
const statusFilters: GoalStatusFilter[] = ["ALL", "ACTIVE", "PAUSED", "COMPLETED"];

function createEmptyDraft(): GoalDraft {
  return {
    area: "MIND",
    color: colorChoices[0],
    description: "",
    progress: 0,
    status: "ACTIVE",
    targetDate: "",
    title: "",
  };
}

function dateInputValue(value?: Date | string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value?: Date | string | null) {
  if (!value) {
    return "Sem prazo";
  }

  return new Date(value).toLocaleDateString("pt-BR");
}

function goalToDraft(goal: Goal): GoalDraft {
  return {
    area: goal.area,
    color: goal.color ?? colorChoices[0],
    description: goal.description ?? "",
    progress: goal.progress,
    status: goal.status,
    targetDate: dateInputValue(goal.targetDate),
    title: goal.title,
  };
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
  const [draft, setDraft] = useState<GoalDraft>(() => (goal ? goalToDraft(goal) : createEmptyDraft()));
  const [titleError, setTitleError] = useState("");

  const isSaving = createGoal.isPending || updateGoal.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title.trim()) {
      setTitleError("Informe um titulo para a meta.");
      return;
    }

    setTitleError("");

    const progress = draft.status === "COMPLETED" ? 100 : draft.progress;
    const payload = {
      area: draft.area,
      color: draft.color || null,
      description: draft.description.trim() || null,
      progress,
      status: draft.status,
      targetDate: draft.targetDate || null,
      title: draft.title.trim(),
    };

    if (goal) {
      await updateGoal.mutateAsync({ id: goal.id, data: payload });
    } else {
      await createGoal.mutateAsync(payload);
      setDraft(createEmptyDraft());
    }

    onDone?.();
  }

  return (
    <form className="grid gap-4" id={goal ? `goal-form-${goal.id}` : "goal-form-new"} onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-text-secondary" htmlFor={goal ? `goal-title-${goal.id}` : "goal-title-new"}>
            Titulo
          </label>
          <Input
            aria-describedby={titleError ? (goal ? `goal-title-error-${goal.id}` : "goal-title-error-new") : undefined}
            aria-invalid={Boolean(titleError)}
            id={goal ? `goal-title-${goal.id}` : "goal-title-new"}
            maxLength={80}
            onChange={(event) => {
              setDraft((current) => ({ ...current, title: event.target.value }));
              if (titleError) {
                setTitleError("");
              }
            }}
            placeholder="Ex.: Cuidar da saude e perder 8 kg"
            value={draft.title}
          />
          {titleError ? (
            <p className="text-xs font-medium text-destructive" id={goal ? `goal-title-error-${goal.id}` : "goal-title-error-new"}>
              {titleError}
            </p>
          ) : null}
        </div>

        <div className="grid gap-1.5">
          <label className="text-xs font-semibold text-text-secondary" htmlFor={goal ? `goal-area-${goal.id}` : "goal-area-new"}>
            Area
          </label>
          <Select
            onValueChange={(value) => setDraft((current) => ({ ...current, area: value as GoalArea }))}
            value={draft.area}
          >
            <SelectTrigger id={goal ? `goal-area-${goal.id}` : "goal-area-new"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BODY">Corpo</SelectItem>
              <SelectItem value="MIND">Mente</SelectItem>
              <SelectItem value="HOME">Casa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <label className="text-xs font-semibold text-text-secondary" htmlFor={goal ? `goal-target-${goal.id}` : "goal-target-new"}>
            Prazo
          </label>
          <Input
            id={goal ? `goal-target-${goal.id}` : "goal-target-new"}
            onChange={(event) => setDraft((current) => ({ ...current, targetDate: event.target.value }))}
            type="date"
            value={draft.targetDate}
          />
        </div>

        <div className="grid gap-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-text-secondary" htmlFor={goal ? `goal-description-${goal.id}` : "goal-description-new"}>
            Descricao
          </label>
          <Textarea
            id={goal ? `goal-description-${goal.id}` : "goal-description-new"}
            maxLength={240}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
            placeholder="Por que essa meta e importante? Qual resultado voce quer alcancar?"
            value={draft.description}
          />
          <p className="text-[11px] text-text-tertiary">Use uma descricao curta, clara e orientada a resultado.</p>
        </div>

        <div className="grid gap-1.5">
          <label className="text-xs font-semibold text-text-secondary" htmlFor={goal ? `goal-status-${goal.id}` : "goal-status-new"}>
            Status
          </label>
          <Select
            onValueChange={(value) => setDraft((current) => ({ ...current, status: value as GoalStatus }))}
            value={draft.status}
          >
            <SelectTrigger id={goal ? `goal-status-${goal.id}` : "goal-status-new"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Ativa</SelectItem>
              <SelectItem value="PAUSED">Pausada</SelectItem>
              <SelectItem value="COMPLETED">Concluida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <span className="text-xs font-semibold text-text-secondary">Cor</span>
          <div className="flex flex-wrap gap-2">
            {colorChoices.map((color) => (
              <button
                aria-label={`Selecionar cor ${color}`}
                aria-pressed={draft.color === color}
                className={cn(
                  "size-8 rounded-lg border-2 border-transparent shadow-snow-1 outline outline-1 outline-border transition-[border-color,transform] hover:-translate-y-px",
                  draft.color === color && "border-static-white outline-foreground/30",
                )}
                key={color}
                onClick={() => setDraft((current) => ({ ...current, color }))}
                style={{ backgroundColor: color }}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-semibold text-text-secondary" htmlFor={goal ? `goal-progress-${goal.id}` : "goal-progress-new"}>
              Progresso
            </label>
            <span className="rounded-lg border border-border bg-panel px-2 py-1 text-xs font-semibold text-text-secondary">
              {draft.status === "COMPLETED" ? 100 : draft.progress}%
            </span>
          </div>
          <Input
            id={goal ? `goal-progress-${goal.id}` : "goal-progress-new"}
            max={100}
            min={0}
            onChange={(event) => setDraft((current) => ({ ...current, progress: Number(event.target.value) }))}
            type="range"
            value={draft.status === "COMPLETED" ? 100 : draft.progress}
          />
        </div>
      </div>

      <DialogFooter className="border-t border-border pt-4">
        <Button disabled={isSaving} type="submit">
          <Plus className="size-4" />
          {goal ? "Salvar meta" : "Criar meta"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function GoalModal({
  goal,
  onOpenChange,
  open,
}: {
  goal?: Goal;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="pr-8">
          <DialogTitle>{goal ? "Editar meta" : "Nova meta"}</DialogTitle>
          <DialogDescription>
            Defina o objetivo, a area, o prazo e o progresso. Voce podera ajustar tudo depois.
          </DialogDescription>
        </DialogHeader>
        <GoalForm goal={goal} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function GoalMetrics({ goals }: { goals: Goal[] }) {
  const metrics = useMemo(() => {
    const now = new Date();
    const soon = new Date(now);
    soon.setDate(now.getDate() + 7);

    return {
      active: goals.filter((goal) => goal.status === "ACTIVE").length,
      average: goals.length
        ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
        : 0,
      completed: goals.filter((goal) => goal.status === "COMPLETED").length,
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
      <StatCard delta="Em andamento" icon={Target} label="Metas ativas" value={metrics.active} />
      <StatCard delta="Finalizadas" icon={CheckCircle2} label="Metas concluidas" value={metrics.completed} />
      <StatCard delta="Metas visiveis" icon={TrendingUp} label="Progresso medio" value={`${metrics.average}%`} />
      <StatCard delta="Proximos 7 dias" icon={CalendarClock} label="Perto do prazo" value={metrics.dueSoon} />
    </div>
  );
}

function GoalRow({
  goal,
  onDelete,
  onEdit,
}: {
  goal: Goal;
  onDelete: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
}) {
  const updateGoal = useUpdateGoal();
  const area = areaMeta[goal.area];
  const AreaIcon = area.Icon;

  return (
    <article className="grid gap-3 border-b border-border/70 px-3 py-3 text-xs transition-colors hover:bg-hover/70 md:grid-cols-[minmax(15rem,1.5fr)_minmax(8rem,0.7fr)_minmax(8rem,0.65fr)_minmax(10rem,0.8fr)_8.5rem] md:items-center md:gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="h-10 w-2 shrink-0 rounded-full" style={{ backgroundColor: goal.color ?? colorChoices[0] }} />
        <div className="min-w-0">
          <h2 className="truncate text-[13px] font-semibold text-foreground">{goal.title}</h2>
          <p className="mt-0.5 truncate text-[11px] text-text-secondary">
            {goal.description || formatDate(goal.targetDate)}
          </p>
        </div>
      </div>

      <div>
        <Badge className={cn("gap-1.5", area.tone)} variant="outline">
          <AreaIcon className="size-3" />
          {area.label}
        </Badge>
      </div>

      <div>
        <Badge className={cn("gap-1.5", statusTone[goal.status])} variant="outline">
          <span className="size-1.5 rounded-full bg-current" />
          {statusLabels[goal.status]}
        </Badge>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <Progress className="min-w-20 flex-1" value={goal.progress} />
        <span className="w-9 shrink-0 text-right text-[11px] font-semibold text-text-secondary">{goal.progress}%</span>
      </div>

      <div className="flex justify-start gap-1 md:justify-end">
        <Button aria-label={`Editar ${goal.title}`} onClick={() => onEdit(goal)} size="icon-sm" title="Editar" variant="ghost">
          <Edit3 className="size-4" />
        </Button>
        <Button
          aria-label={goal.status === "PAUSED" ? `Retomar ${goal.title}` : `Pausar ${goal.title}`}
          onClick={() =>
            updateGoal.mutate({
              id: goal.id,
              data: {
                status: goal.status === "PAUSED" ? "ACTIVE" : "PAUSED",
              },
            })
          }
          size="icon-sm"
          title={goal.status === "PAUSED" ? "Retomar" : "Pausar"}
          variant="ghost"
        >
          <PauseCircle className="size-4" />
        </Button>
        <Button
          aria-label={`Concluir ${goal.title}`}
          onClick={() =>
            updateGoal.mutate({
              id: goal.id,
              data: { progress: 100, status: "COMPLETED" },
            })
          }
          size="icon-sm"
          title="Concluir"
          variant="ghost"
        >
          <CheckCircle2 className="size-4" />
        </Button>
        <Button aria-label={`Excluir ${goal.title}`} onClick={() => onDelete(goal)} size="icon-sm" title="Excluir" variant="ghost">
          <Trash2 className="size-4" />
        </Button>
      </div>
    </article>
  );
}

export function GoalBoard() {
  const [areaFilter, setAreaFilter] = useState<GoalAreaFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<GoalStatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const { data: goals = [], isError, isLoading, refetch } = useGoals({
    area: areaFilter === "ALL" ? undefined : areaFilter,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });
  const deleteGoal = useDeleteGoal();

  const visibleGoals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return goals;
    }

    return goals.filter((goal) =>
      `${goal.title} ${goal.description ?? ""} ${areaMeta[goal.area].label} ${statusLabels[goal.status]}`
        .toLowerCase()
        .includes(query)
    );
  }, [goals, searchQuery]);

  function confirmDelete() {
    if (!goalToDelete) {
      return;
    }

    deleteGoal.mutate(goalToDelete.id, {
      onSuccess: () => setGoalToDelete(null),
    });
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <header className="flex shrink-0 flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-text-tertiary">
              Gestao
            </p>
            <h1 className="mt-2 break-words text-2xl font-bold leading-[1.12] tracking-[-0.035em] text-foreground sm:text-[28px]">
              Metas
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Crie objetivos, acompanhe o progresso e mantenha o foco no que importa.
            </p>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-4" />
            Nova meta
          </Button>
        </header>

        <GoalMetrics goals={visibleGoals} />

        <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <SegmentedControl
              aria-label="Filtrar metas por area"
              onValueChange={setAreaFilter}
              options={areaFilters.map((area) => ({
                label: area === "ALL" ? "Todas" : areaMeta[area].label,
                value: area,
              }))}
              value={areaFilter}
            />
            <SegmentedControl
              aria-label="Filtrar metas por status"
              onValueChange={setStatusFilter}
              options={statusFilters.map((status) => ({
                label: status === "ALL" ? "Todos status" : statusLabels[status],
                value: status,
              }))}
              value={statusFilter}
            />
          </div>

          <label className="flex h-9 min-w-0 items-center gap-2 rounded-[var(--r-10)] border border-border-strong bg-panel px-3 text-text-secondary shadow-snow-1 lg:w-72">
            <Search className="size-4 shrink-0" />
            <span className="sr-only">Buscar meta</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-text-tertiary"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar meta..."
              type="search"
              value={searchQuery}
            />
          </label>
        </div>

        <section className="min-h-0 flex-1 overflow-hidden rounded-[var(--r-14)] border border-border bg-panel shadow-snow-1">
          <div className="hidden min-h-12 grid-cols-[minmax(15rem,1.5fr)_minmax(8rem,0.7fr)_minmax(8rem,0.65fr)_minmax(10rem,0.8fr)_8.5rem] items-center gap-4 border-b border-border px-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-text-tertiary md:grid">
            <span>Meta</span>
            <span>Area</span>
            <span>Status</span>
            <span>Progresso</span>
            <span className="sr-only">Acoes</span>
          </div>

          <div className="h-full min-h-0 overflow-y-auto">
            {isLoading ? (
              <div className="grid min-h-80 place-items-center p-8 text-center">
                <div>
                  <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl border border-border bg-secondary text-text-secondary">
                    <ListFilter className="size-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Carregando metas.</p>
                </div>
              </div>
            ) : isError ? (
              <div className="grid min-h-80 place-items-center p-8 text-center">
                <div>
                  <p className="text-sm font-semibold text-destructive">Nao foi possivel carregar as metas.</p>
                  <Button className="mt-3" size="sm" variant="outline" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </div>
              </div>
            ) : visibleGoals.length ? (
              visibleGoals.map((goal) => (
                <GoalRow goal={goal} key={goal.id} onDelete={setGoalToDelete} onEdit={setGoalToEdit} />
              ))
            ) : (
              <div className="grid min-h-80 place-items-center p-8 text-center">
                <div>
                  <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-border bg-secondary text-primary">
                    <Target className="size-6" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">Nenhuma meta encontrada</h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
                    Ajuste os filtros ou crie uma nova meta para comecar seu acompanhamento.
                  </p>
                  <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="size-4" />
                    Nova meta
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <GoalModal onOpenChange={setIsCreateOpen} open={isCreateOpen} />
      <GoalModal
        goal={goalToEdit ?? undefined}
        onOpenChange={(open) => {
          if (!open) {
            setGoalToEdit(null);
          }
        }}
        open={Boolean(goalToEdit)}
      />
      <ConfirmDialog
        description={
          goalToDelete
            ? `A meta "${goalToDelete.title}" sera removida permanentemente.`
            : "Esta meta sera removida permanentemente."
        }
        isPending={deleteGoal.isPending}
        onConfirm={confirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            setGoalToDelete(null);
          }
        }}
        open={Boolean(goalToDelete)}
        title="Excluir meta?"
      />
    </>
  );
}
