"use client";

import { FileText, Search, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote } from "@/hooks/useNoteMutations";
import type { Note } from "@/types/BaseInterfaces";

function NoteEditor({ note }: { note: Note }) {
  const updateNote = useUpdateNote();
  const [title, setTitle] = useState(note.title);
  const [category, setCategory] = useState(note.category ?? "");
  const [content, setContent] = useState(note.content);

  return (
    <form
      className="grid gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        updateNote.mutate({
          id: note.id,
          data: { category: category || null, content, title },
        });
      }}
    >
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
        <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
      </div>
      <textarea
        className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <Button className="justify-self-end" type="submit">
        Save
      </Button>
    </form>
  );
}

export default function NotesPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const { data: notes = [], isLoading } = useNotes({ q: search });
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  const categories = useMemo(
    () => Array.from(new Set(notes.map((note) => note.category).filter(Boolean))) as string[],
    [notes]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    createNote.mutate(
      { category, content, title: title.trim() },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setCategory("");
        },
      }
    );
  }

  return (
    <DashboardViewport header={<MenuPageHeader eyebrow="Knowledge base" title="Notes" />}>
      <div className="grid min-h-0 gap-3 overflow-hidden lg:grid-cols-[minmax(18rem,0.42fr)_minmax(0,1fr)]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Create note
            </CardTitle>
            <CardDescription>Independent notes, no Goal ownership needed.</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <form className="grid gap-2" onSubmit={handleSubmit}>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
              <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
              <textarea
                className="min-h-36 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Content"
              />
              <Button disabled={createNote.isPending} type="submit">
                Save note
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex min-h-0 min-w-0 flex-col overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="shrink-0 p-3">
            <CardTitle>Notes library</CardTitle>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes"
              />
            </div>
            {categories.length ? (
              <div className="flex flex-wrap gap-1">
                {categories.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 pt-0">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading notes.</p>
            ) : notes.length ? (
              notes.map((note) => (
                <div className="grid gap-3 rounded-lg border border-border/70 p-3" key={note.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{note.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => deleteNote.mutate(note.id)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                  <NoteEditor note={note} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No notes found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardViewport>
  );
}
