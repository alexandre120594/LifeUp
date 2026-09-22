"use client";

import { Eye, Inbox, NotebookText, Pencil, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { TaskRow } from "@/components/productivity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateInboxItem,
  useDeleteInboxItem,
  useInboxItems,
  useUpdateInboxItem,
} from "@/hooks/useInboxMutations";
import type { InboxItem, InboxItemStatus, InboxItemType } from "@/types/BaseInterfaces";

const inboxTypes: Array<{ label: string; value: InboxItemType }> = [
  { label: "Ideia", value: "idea" },
  { label: "Nota", value: "note" },
  { label: "Estudo", value: "study" },
  { label: "Financas", value: "finance" },
  { label: "Pensamento", value: "thought" },
];

const inboxStatuses: Array<{ label: string; value: InboxItemStatus }> = [
  { label: "Pendente", value: "unprocessed" },
  { label: "Processado", value: "processed" },
];

const inboxTypeLabels = Object.fromEntries(inboxTypes.map((item) => [item.value, item.label])) as Record<InboxItemType, string>;
const inboxStatusLabels = Object.fromEntries(inboxStatuses.map((item) => [item.value, item.label])) as Record<InboxItemStatus, string>;
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" });

type InboxDraft = {
  content: string;
  status: InboxItemStatus;
  title: string;
  type: InboxItemType;
};

function InboxEditDialog({ item, onOpenChange }: { item: InboxItem; onOpenChange: (open: boolean) => void }) {
  const updateInboxItem = useUpdateInboxItem();
  const [draft, setDraft] = useState<InboxDraft>({
    content: item.content ?? "",
    status: item.status,
    title: item.title,
    type: item.type,
  });
  const [titleError, setTitleError] = useState("");
  const fieldPrefix = `inbox-edit-${item.id}`;

  function updateDraft<Field extends keyof InboxDraft>(field: Field, value: InboxDraft[Field]) {
    setDraft((current) => ({ ...current, [field]: value }));
    if (field === "title") setTitleError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setTitleError("Informe um titulo para a captura.");
      return;
    }

    updateInboxItem.mutate(
      {
        id: item.id,
        data: {
          title: draft.title.trim(),
          content: draft.content,
          type: draft.type,
          status: draft.status,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden p-0 sm:max-w-2xl">
        <form className="flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col" onSubmit={handleSubmit}>
          <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12">
            <DialogTitle>Editar captura</DialogTitle>
            <DialogDescription>Atualize os dados e o estado deste item.</DialogDescription>
          </DialogHeader>
          <div className="grid min-h-0 gap-4 overflow-y-auto px-5 py-4">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-text-secondary" htmlFor={`${fieldPrefix}-title`}>Titulo</label>
              <Input
                aria-describedby={titleError ? `${fieldPrefix}-title-error` : undefined}
                aria-invalid={Boolean(titleError)}
                autoFocus
                id={`${fieldPrefix}-title`}
                maxLength={160}
                onChange={(event) => updateDraft("title", event.target.value)}
                value={draft.title}
              />
              {titleError ? <p className="text-xs font-medium text-destructive" id={`${fieldPrefix}-title-error`}>{titleError}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-text-secondary" htmlFor={`${fieldPrefix}-content`}>Detalhes</label>
              <Textarea
                className="min-h-40 resize-none"
                id={`${fieldPrefix}-content`}
                onChange={(event) => updateDraft("content", event.target.value)}
                placeholder="Contexto, links ou proximos passos"
                value={draft.content}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-text-secondary" htmlFor={`${fieldPrefix}-type`}>Tipo</label>
                <Select value={draft.type} onValueChange={(value) => updateDraft("type", value as InboxItemType)}>
                  <SelectTrigger id={`${fieldPrefix}-type`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {inboxTypes.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-text-secondary" htmlFor={`${fieldPrefix}-status`}>Status</label>
                <Select value={draft.status} onValueChange={(value) => updateDraft("status", value as InboxItemStatus)}>
                  <SelectTrigger id={`${fieldPrefix}-status`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {inboxStatuses.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-border px-5 py-4">
            <Button disabled={updateInboxItem.isPending} onClick={() => onOpenChange(false)} type="button" variant="outline">Cancelar</Button>
            <Button disabled={updateInboxItem.isPending} type="submit">{updateInboxItem.isPending ? "Salvando..." : "Salvar alteracoes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InboxViewer({ item, onEdit, onOpenChange }: { item: InboxItem; onEdit: () => void; onOpenChange: (open: boolean) => void }) {
  const wasUpdated = new Date(item.updatedAt).getTime() !== new Date(item.createdAt).getTime();

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{inboxTypeLabels[item.type]}</Badge>
            <Badge variant="outline">{inboxStatusLabels[item.status]}</Badge>
          </div>
          <DialogTitle className="break-words text-xl leading-tight">{item.title}</DialogTitle>
          <DialogDescription>
            Criada em {dateFormatter.format(new Date(item.createdAt))}
            {wasUpdated ? ` · Atualizada em ${dateFormatter.format(new Date(item.updatedAt))}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {item.content ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground">{item.content}</p>
          ) : (
            <p className="text-sm text-text-tertiary">Esta captura nao possui detalhes.</p>
          )}
        </div>
        <DialogFooter className="shrink-0 border-t border-border px-5 py-4">
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">Fechar</Button>
          <Button onClick={onEdit} type="button"><Pencil className="size-4" aria-hidden="true" />Editar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function InboxPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<InboxItemType>("idea");
  const [status, setStatus] = useState("unprocessed");
  const [titleError, setTitleError] = useState("");
  const [itemToView, setItemToView] = useState<InboxItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<InboxItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const { data: items = [], isError, isLoading, refetch } = useInboxItems({ status });
  const createInboxItem = useCreateInboxItem();
  const updateInboxItem = useUpdateInboxItem();
  const deleteInboxItem = useDeleteInboxItem();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setTitleError("Informe um titulo para capturar.");
      return;
    }

    setTitleError("");
    createInboxItem.mutate(
      { content, title: title.trim(), type },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setType("idea");
          setTitleError("");
        },
      }
    );
  }

  function openEditor(item: InboxItem) {
    setItemToView(null);
    setItemToEdit(item);
  }

  function confirmDelete() {
    if (!itemToDelete) return;
    deleteInboxItem.mutate(itemToDelete.id, { onSuccess: () => setItemToDelete(null) });
  }

  return (
    <DashboardViewport
      contentClassName="flex flex-col overflow-hidden pb-4"
      header={<MenuPageHeader eyebrow="Entrada rapida" title="Captura" />}
    >
      <div className="grid h-full min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden lg:grid-cols-[minmax(18rem,0.42fr)_minmax(0,1fr)] lg:grid-rows-1">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Inbox className="h-4 w-4" />Captura rapida</CardTitle>
            <CardDescription>Guarde ideias soltas antes de processar em notas ou acoes.</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <form className="grid gap-2" onSubmit={handleSubmit}>
              <div className="grid gap-1">
                <label className="text-xs font-medium text-text-secondary" htmlFor="inbox-title">Titulo</label>
                <Input
                  aria-describedby={titleError ? "inbox-title-error" : undefined}
                  aria-invalid={Boolean(titleError)}
                  id="inbox-title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (titleError) setTitleError("");
                  }}
                  placeholder="Ex.: Revisar ideia"
                />
                {titleError ? <p className="text-xs font-medium text-destructive" id="inbox-title-error">{titleError}</p> : null}
              </div>
              <label className="text-xs font-medium text-text-secondary" htmlFor="inbox-content">Detalhes</label>
              <Textarea className="min-h-28 resize-none" id="inbox-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Contexto, links ou proximos passos" />
              <Select value={type} onValueChange={(value) => setType(value as InboxItemType)}>
                <SelectTrigger aria-label="Tipo da captura"><SelectValue /></SelectTrigger>
                <SelectContent>{inboxTypes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button disabled={createInboxItem.isPending} type="submit">{createInboxItem.isPending ? "Capturando..." : "Capturar"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex min-h-0 min-w-0 flex-col overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="shrink-0 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Itens capturados</CardTitle>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger aria-label="Filtro de status" className="w-[12rem]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unprocessed">Pendentes</SelectItem>
                  <SelectItem value="processed">Processados</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 pt-0">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando capturas.</p>
            ) : isError ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                <p className="text-sm font-medium text-destructive">Nao foi possivel carregar as capturas.</p>
                <Button className="mt-2" size="sm" variant="outline" onClick={() => refetch()}>Tentar novamente</Button>
              </div>
            ) : items.length ? (
              items.map((item) => (
                <TaskRow
                  actions={<>
                    <Button aria-label={`Visualizar ${item.title}`} size="icon-sm" type="button" variant="outline" onClick={() => setItemToView(item)}><Eye className="h-4 w-4" aria-hidden="true" /></Button>
                    <Button aria-label={`Editar ${item.title}`} size="icon-sm" type="button" variant="outline" onClick={() => openEditor(item)}><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                    <Button aria-label={`Converter ${item.title} em nota`} size="icon-sm" type="button" variant="outline" onClick={() => updateInboxItem.mutate({ id: item.id, data: { convertToNote: true } })}><NotebookText className="h-4 w-4" aria-hidden="true" /></Button>
                    <Button aria-label={`Excluir ${item.title}`} size="icon-sm" type="button" variant="outline" onClick={() => setItemToDelete({ id: item.id, title: item.title })}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>
                  </>}
                  className="border border-border"
                  completed={item.status === "processed"}
                  key={item.id}
                  meta={<span className="flex min-w-0 items-center gap-1"><Badge variant="outline">{inboxTypeLabels[item.type]}</Badge>{item.content ? <span className="truncate">{item.content}</span> : null}</span>}
                  onToggle={() => updateInboxItem.mutate({ id: item.id, data: { status: item.status === "processed" ? "unprocessed" : "processed" } })}
                  title={item.title}
                />
              ))
            ) : (
              <div className="rounded-md border border-dashed border-border/80 p-4">
                <p className="font-medium">Nenhuma captura neste filtro.</p>
                <p className="mt-1 text-sm text-muted-foreground">Use o formulario ao lado para guardar a primeira ideia.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {itemToView ? <InboxViewer item={itemToView} onEdit={() => openEditor(itemToView)} onOpenChange={(open) => { if (!open) setItemToView(null); }} /> : null}
      {itemToEdit ? <InboxEditDialog item={itemToEdit} onOpenChange={(open) => { if (!open) setItemToEdit(null); }} /> : null}
      <ConfirmDialog
        description={itemToDelete ? `A captura "${itemToDelete.title}" sera removida permanentemente.` : "Esta captura sera removida permanentemente."}
        isPending={deleteInboxItem.isPending}
        onConfirm={confirmDelete}
        onOpenChange={(open) => { if (!open) setItemToDelete(null); }}
        open={Boolean(itemToDelete)}
        title="Excluir captura?"
      />
    </DashboardViewport>
  );
}
