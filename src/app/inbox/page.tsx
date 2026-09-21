"use client";

import { CheckCircle2, Inbox, NotebookText, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { TaskRow } from "@/components/productivity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useCreateInboxItem,
  useDeleteInboxItem,
  useInboxItems,
  useUpdateInboxItem,
} from "@/hooks/useInboxMutations";
import type { InboxItemType } from "@/types/BaseInterfaces";

const inboxTypes: Array<{ label: string; value: InboxItemType }> = [
  { label: "Ideia", value: "idea" },
  { label: "Nota", value: "note" },
  { label: "Estudo", value: "study" },
  { label: "Financas", value: "finance" },
  { label: "Pensamento", value: "thought" },
];

const inboxTypeLabels = Object.fromEntries(
  inboxTypes.map((item) => [item.value, item.label])
) as Record<InboxItemType, string>;

export default function InboxPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<InboxItemType>("idea");
  const [status, setStatus] = useState("unprocessed");
  const [titleError, setTitleError] = useState("");
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

  function confirmDelete() {
    if (!itemToDelete) {
      return;
    }

    deleteInboxItem.mutate(itemToDelete.id, {
      onSuccess: () => setItemToDelete(null),
    });
  }

  return (
    <DashboardViewport header={<MenuPageHeader eyebrow="Entrada rapida" title="Captura" />}>
      <div className="grid min-h-0 gap-3 overflow-hidden lg:grid-cols-[minmax(18rem,0.42fr)_minmax(0,1fr)]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Inbox className="h-4 w-4" />
              Captura rapida
            </CardTitle>
            <CardDescription>Guarde ideias soltas antes de processar em notas ou acoes.</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <form className="grid gap-2" onSubmit={handleSubmit}>
              <div className="grid gap-1">
                <label className="text-xs font-medium text-text-secondary" htmlFor="inbox-title">
                  Titulo
                </label>
                <Input
                  aria-describedby={titleError ? "inbox-title-error" : undefined}
                  aria-invalid={Boolean(titleError)}
                  id="inbox-title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (titleError) {
                      setTitleError("");
                    }
                  }}
                  placeholder="Ex.: Revisar ideia"
                />
                {titleError ? (
                  <p className="text-xs font-medium text-destructive" id="inbox-title-error">
                    {titleError}
                  </p>
                ) : null}
              </div>
              <label className="text-xs font-medium text-text-secondary" htmlFor="inbox-content">
                Detalhes
              </label>
              <textarea
                className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                id="inbox-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Contexto, links ou proximos passos"
              />
              <Select
                value={type}
                onValueChange={(value) => setType(value as InboxItemType)}
              >
                <SelectTrigger aria-label="Tipo da captura">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inboxTypes.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button disabled={createInboxItem.isPending} type="submit">
                Capturar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex min-h-0 min-w-0 flex-col overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="shrink-0 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Itens capturados</CardTitle>
              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger aria-label="Filtro de status" className="w-[12rem]">
                  <SelectValue />
                </SelectTrigger>
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
                <p className="text-sm font-medium text-destructive">
                  Nao foi possivel carregar as capturas.
                </p>
                <Button className="mt-2" size="sm" variant="outline" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            ) : items.length ? (
              items.map((item) => (
                <TaskRow
                  actions={<>
                      <Button
                        aria-label={item.status === "processed" ? `Reabrir ${item.title}` : `Concluir ${item.title}`}
                        size="icon-sm"
                        variant="outline"
                        onClick={() =>
                          updateInboxItem.mutate({
                            id: item.id,
                            data: {
                              status: item.status === "processed" ? "unprocessed" : "processed",
                            },
                          })
                        }
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label={`Converter ${item.title} em nota`}
                        size="icon-sm"
                        variant="outline"
                        onClick={() => updateInboxItem.mutate({ id: item.id, data: { convertToNote: true } })}
                      >
                        <NotebookText className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label={`Excluir ${item.title}`}
                        size="icon-sm"
                        variant="outline"
                        onClick={() => setItemToDelete({ id: item.id, title: item.title })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                <p className="mt-1 text-sm text-muted-foreground">
                  Use o formulario ao lado para guardar a primeira ideia.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        description={
          itemToDelete
            ? `A captura "${itemToDelete.title}" sera removida permanentemente.`
            : "Esta captura sera removida permanentemente."
        }
        isPending={deleteInboxItem.isPending}
        onConfirm={confirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            setItemToDelete(null);
          }
        }}
        open={Boolean(itemToDelete)}
        title="Excluir captura?"
      />
    </DashboardViewport>
  );
}
