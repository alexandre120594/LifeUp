"use client";

import { Eye, FileText, FolderOpen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, type ReactNode, useMemo, useState } from "react";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, ErrorState, FieldError, LoadingState, RetryButton } from "@/components/ui/app-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote } from "@/hooks/useNoteMutations";
import type { Note } from "@/types/BaseInterfaces";

type NoteDraft = { category: string; content: string; title: string };

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function NoteFormDialog({ note, onOpenChange }: { note: Note | null; onOpenChange: (open: boolean) => void }) {
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const [draft, setDraft] = useState<NoteDraft>({
    category: note?.category ?? "",
    content: note?.content ?? "",
    title: note?.title ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<NoteDraft>>({});
  const isPending = createNote.isPending || updateNote.isPending;
  const fieldPrefix = note ? `note-edit-${note.id}` : "note-create";

  function updateDraft(field: keyof NoteDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<NoteDraft> = {};
    if (!draft.title.trim()) nextErrors.title = "Informe um titulo para a nota.";
    if (!draft.content.trim()) nextErrors.content = "Escreva o conteudo da nota.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const data = {
      category: draft.category.trim() || undefined,
      content: draft.content.trim(),
      title: draft.title.trim(),
    };
    const closeDialog = () => onOpenChange(false);

    if (note) {
      updateNote.mutate(
        { id: note.id, data: { ...data, category: draft.category.trim() || null } },
        { onSuccess: closeDialog }
      );
      return;
    }
    createNote.mutate(data, { onSuccess: closeDialog });
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-hidden p-0 sm:max-w-2xl">
        <form className="flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col" onSubmit={handleSubmit}>
          <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12">
            <DialogTitle>{note ? "Editar nota" : "Nova nota"}</DialogTitle>
            <DialogDescription>
              {note ? "Atualize o titulo, a categoria ou o conteudo." : "Registre uma ideia, referencia ou contexto para consultar depois."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid min-h-0 gap-4 overflow-y-auto px-5 py-4">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-text-secondary" htmlFor={`${fieldPrefix}-title`}>Titulo</label>
                <Input
                  aria-describedby={fieldErrors.title ? `${fieldPrefix}-title-error` : undefined}
                  aria-invalid={Boolean(fieldErrors.title)}
                  autoFocus
                  id={`${fieldPrefix}-title`}
                  maxLength={160}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  placeholder="Ex.: Decisoes da semana"
                  value={draft.title}
                />
                <FieldError id={`${fieldPrefix}-title-error`}>{fieldErrors.title}</FieldError>
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-text-secondary" htmlFor={`${fieldPrefix}-category`}>Categoria</label>
                <Input id={`${fieldPrefix}-category`} maxLength={60} onChange={(event) => updateDraft("category", event.target.value)} placeholder="Opcional" value={draft.category} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-text-secondary" htmlFor={`${fieldPrefix}-content`}>Conteudo</label>
              <Textarea
                aria-describedby={fieldErrors.content ? `${fieldPrefix}-content-error` : undefined}
                aria-invalid={Boolean(fieldErrors.content)}
                className="min-h-56 resize-none sm:min-h-72"
                id={`${fieldPrefix}-content`}
                onChange={(event) => updateDraft("content", event.target.value)}
                placeholder="Escreva sua nota"
                value={draft.content}
              />
              <FieldError id={`${fieldPrefix}-content-error`}>{fieldErrors.content}</FieldError>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-border px-5 py-4">
            <Button disabled={isPending} onClick={() => onOpenChange(false)} type="button" variant="outline">Cancelar</Button>
            <Button disabled={isPending} type="submit">{isPending ? "Salvando..." : note ? "Salvar alteracoes" : "Criar nota"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NoteViewer({ note, onOpenChange }: { note: Note; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12">
          <div className="flex flex-wrap items-center gap-2">
            {note.category ? <Badge variant="outline">{note.category}</Badge> : null}
            <span className="text-xs text-text-tertiary">Atualizada em {dateFormatter.format(new Date(note.updatedAt))}</span>
          </div>
          <DialogTitle className="break-words text-xl leading-tight">{note.title}</DialogTitle>
          <DialogDescription>Visualizacao completa da nota.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground">{note.content}</p>
        </div>
        <DialogFooter className="shrink-0 border-t border-border px-5 py-4">
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const [noteToView, setNoteToView] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const noteFilters = { category: selectedCategory === "all" ? undefined : selectedCategory, q: search.trim() || undefined };
  const { data: notes = [], isError, isLoading, refetch } = useNotes(noteFilters);
  const { data: allNotes = [] } = useNotes();
  const deleteNote = useDeleteNote();

  const categories = useMemo(
    () => Array.from(new Set(allNotes.map((note) => note.category?.trim()).filter((category): category is string => Boolean(category)))).sort((a, b) => a.localeCompare(b)),
    [allNotes]
  );
  function openCreateDialog() {
    setNoteToEdit(null);
    setIsEditorOpen(true);
  }
  function openEditDialog(note: Note) {
    setNoteToEdit(note);
    setIsEditorOpen(true);
  }
  function closeEditor(open: boolean) {
    setIsEditorOpen(open);
    if (!open) setNoteToEdit(null);
  }
  function confirmDelete() {
    if (!noteToDelete) return;
    deleteNote.mutate(noteToDelete.id, { onSuccess: () => setNoteToDelete(null) });
  }

  return (
    <DashboardViewport
      contentClassName="flex flex-col overflow-hidden pb-4"
      header={
        <MenuPageHeader
          action={<Button onClick={openCreateDialog} type="button"><Plus className="size-4" aria-hidden="true" />Nova nota</Button>}
          eyebrow="Biblioteca"
          title="Notas"
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <section className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3" aria-label="Resumo das notas">
          <MetricCard icon={<FileText className="size-4" />} label="Total" value={allNotes.length} primary />
          <MetricCard icon={<FolderOpen className="size-4" />} label="Categorias" value={categories.length} />
          <MetricCard icon={<Pencil className="size-4" />} label="Exibidas" value={notes.length} />
        </section>

        <Card className="flex min-h-0 flex-1 gap-0 overflow-hidden py-0">
          <CardHeader className="shrink-0 gap-3 border-b border-border p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2"><CardTitle className="text-base">Sua biblioteca</CardTitle><Badge variant="outline">{notes.length}</Badge></div>
              <label className="relative block w-full sm:max-w-sm" htmlFor="notes-search">
                <span className="sr-only">Buscar notas</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
                <Input className="pl-9" id="notes-search" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar notas" value={search} />
              </label>
            </div>
            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="list" aria-label="Categorias de notas">
              <Button className="h-8 shrink-0" onClick={() => setSelectedCategory("all")} type="button" variant={selectedCategory === "all" ? "default" : "outline"}>Todas</Button>
              {categories.map((category) => (
                <Button className="h-8 shrink-0" key={category} onClick={() => setSelectedCategory(category)} type="button" variant={selectedCategory === category ? "default" : "outline"}>{category}</Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            {isLoading ? (
              <LoadingState className="h-full" title="Carregando notas" />
            ) : isError ? (
              <ErrorState action={<RetryButton onClick={() => refetch()} />} className="h-full" description="Verifique a conexao e tente novamente." title="Nao foi possivel carregar as notas." />
            ) : notes.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {notes.map((note) => (
                  <article className="group flex min-h-44 min-w-0 flex-col rounded-xl border border-border bg-panel-subtle p-4 transition-colors hover:border-border-strong hover:bg-hover/50" key={note.id}>
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        {note.category ? <Badge variant="outline">{note.category}</Badge> : null}
                        <h2 className="mt-2 line-clamp-2 break-words font-semibold leading-snug">{note.title}</h2>
                      </div>
                      <Button aria-label={`Visualizar ${note.title}`} onClick={() => setNoteToView(note)} size="icon-sm" type="button" variant="ghost"><Eye className="size-4" aria-hidden="true" /></Button>
                    </div>
                    <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-text-secondary">{note.content}</p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                      <span className="truncate text-[11px] text-text-tertiary">{dateFormatter.format(new Date(note.updatedAt))}</span>
                      <div className="flex shrink-0 gap-1">
                        <Button aria-label={`Editar ${note.title}`} onClick={() => openEditDialog(note)} size="icon-sm" type="button" variant="ghost"><Pencil className="size-4" aria-hidden="true" /></Button>
                        <Button aria-label={`Excluir ${note.title}`} disabled={deleteNote.isPending} onClick={() => setNoteToDelete(note)} size="icon-sm" type="button" variant="ghost"><Trash2 className="size-4" aria-hidden="true" /></Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState action={<Button onClick={openCreateDialog} size="sm" type="button"><Plus className="size-4" />Criar nota</Button>} className="h-full" description="Ajuste a busca ou crie uma nova nota para comecar a biblioteca." title="Nenhuma nota encontrada." />
            )}
          </CardContent>
        </Card>
      </div>

      {isEditorOpen ? <NoteFormDialog note={noteToEdit} onOpenChange={closeEditor} /> : null}
      {noteToView ? <NoteViewer note={noteToView} onOpenChange={(open) => !open && setNoteToView(null)} /> : null}
      <ConfirmDialog
        description={noteToDelete ? `A nota "${noteToDelete.title}" sera removida permanentemente.` : "Esta nota sera removida permanentemente."}
        isPending={deleteNote.isPending}
        onConfirm={confirmDelete}
        onOpenChange={(open) => { if (!open) setNoteToDelete(null); }}
        open={Boolean(noteToDelete)}
        title="Excluir nota?"
      />
    </DashboardViewport>
  );
}

function MetricCard({ icon, label, primary = false, value }: { icon: ReactNode; label: string; primary?: boolean; value: number }) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-center gap-2 p-3 sm:gap-3 sm:p-4">
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg sm:size-9 ${primary ? "bg-primary/10 text-primary" : "bg-secondary text-text-secondary"}`} aria-hidden="true">{icon}</span>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-none sm:text-xl">{value}</p>
          <p className="mt-1 truncate text-[11px] text-text-secondary sm:text-xs">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
