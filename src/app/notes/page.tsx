"use client";

import {
  BookOpenText,
  Eye,
  FileText,
  FolderKanban,
  Link2,
  NotebookPen,
  Search,
  Trash2,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { MenuPageHeader } from "@/components/menu-page-header";
import { OverviewPanel } from "@/components/overview-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
} from "@/hooks/useNoteMutations";
import { useHabit } from "@/hooks/useHabitMutations";
import { useProjects } from "@/hooks/useProjectMutations";
import { useTask } from "@/hooks/useTaskMutation";
import type { Note } from "@/types/BaseInterfaces";

const notesPageSize = 6;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getLinkedLabel(note: Note) {
  return [
    note.project?.title ? `Project: ${note.project.title}` : "",
    note.habit?.title ? `Habit: ${note.habit.title}` : "",
    note.task?.title ? `Task: ${note.task.title}` : "",
  ]
    .filter(Boolean)
    .join(" / ");
}

export default function NotesPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [projectId, setProjectId] = useState("none");
  const [habitId, setHabitId] = useState("none");
  const [taskId, setTaskId] = useState("none");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const { data: notes, isLoading } = useNotes({
    category: categoryFilter === "all" ? undefined : categoryFilter,
    q: search,
  });
  const { data: projects } = useProjects();
  const { data: habits } = useHabit();
  const { data: tasks } = useTask();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const categories = useMemo(
    () =>
      Array.from(
        new Set((notes ?? []).map((note) => note.category).filter(Boolean))
      ) as string[],
    [notes]
  );
  const linkedNotes =
    notes?.filter((note) => note.projectId || note.habitId || note.taskId)
      .length ?? 0;
  const totalPages = Math.max(Math.ceil((notes?.length ?? 0) / notesPageSize), 1);
  const visibleNotes = (notes ?? []).slice(
    (page - 1) * notesPageSize,
    page * notesPageSize
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    createNote.mutate(
      {
        category,
        content,
        habitId: habitId === "none" ? null : habitId,
        projectId: projectId === "none" ? null : projectId,
        taskId: taskId === "none" ? null : taskId,
        title: title.trim(),
      },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setCategory("");
          setProjectId("none");
          setHabitId("none");
          setTaskId("none");
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader eyebrow="Knowledge base" title="Notes" />

      <OverviewPanel
        title="Long-term context connected to work"
        description="Write structured notes and attach them to projects, habits, or tasks when they belong to existing execution records."
        stats={[
          { label: "Notes", value: notes?.length ?? 0, icon: FileText },
          { label: "Linked", value: linkedNotes, icon: Link2 },
          { label: "Categories", value: categories.length, icon: BookOpenText },
        ]}
        progress={{
          detail: `${linkedNotes} notes connected to app records`,
          icon: FolderKanban,
          label: "Linked context",
          value: notes?.length ? Math.round((linkedNotes / notes.length) * 100) : 0,
        }}
        focusTitle="Searchable memory"
        focusDescription="Use categories and links to make notes easier to retrieve from project, habit, and task context."
        focusItems={[
          { label: "Projects", value: projects?.length ?? 0, icon: FolderKanban },
          { label: "Tasks", value: tasks?.length ?? 0, icon: NotebookPen },
        ]}
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Create note</CardTitle>
          <CardDescription>
            Add a general note or connect it to an existing record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
              <Input
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Docker deployment strategy"
                value={title}
              />
              <Input
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Category"
                value={category}
              />
            </div>
            <textarea
              className="min-h-36 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write the note content"
              value={content}
            />
            <div className="grid gap-3 md:grid-cols-3">
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={habitId} onValueChange={setHabitId}>
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No habit</SelectItem>
                  {habits?.map((habit) => (
                    <SelectItem key={habit.id} value={habit.id}>
                      {habit.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={taskId} onValueChange={setTaskId}>
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No task</SelectItem>
                  {tasks?.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button disabled={createNote.isPending} type="submit">
                Save note
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="gap-3">
          <div>
            <CardTitle>Notes library</CardTitle>
            <CardDescription>
              Search and organize notes by category or linked entity.
            </CardDescription>
          </div>
          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search title, content, or category"
                value={search}
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((currentCategory) => (
                  <SelectItem key={currentCategory} value={currentCategory}>
                    {currentCategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {isLoading ? (
            <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
              Loading notes...
            </p>
          ) : notes?.length ? (
            visibleNotes.map((note) => (
              <div
                className="grid min-w-0 gap-3 rounded-lg border border-border/70 bg-background/70 p-4"
                key={note.id}
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {note.category ? (
                      <Badge variant="outline">{note.category}</Badge>
                    ) : null}
                    <span className="text-xs text-muted-foreground">
                      Updated {formatDate(note.updatedAt)}
                    </span>
                  </div>
                  <h3 className="break-words text-base font-semibold [overflow-wrap:anywhere]">
                    {note.title}
                  </h3>
                  <p className="line-clamp-5 break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
                    {note.content}
                  </p>
                  <p className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
                    {getLinkedLabel(note) || "General note"}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <NoteDialog
                    habits={habits ?? []}
                    note={note}
                    onSave={(data) =>
                      updateNote.mutate({ id: note.id, data })
                    }
                    projects={projects ?? []}
                    tasks={tasks ?? []}
                  />
                  <Button
                    onClick={() => deleteNote.mutate(note.id)}
                    type="button"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
              No notes found.
            </p>
          )}
          {notes?.length ? (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-muted-foreground lg:col-span-2">
              <span>
                Page {page} of {totalPages} / {notes.length} notes
              </span>
              <div className="flex gap-2">
                <Button
                  disabled={page <= 1}
                  onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
                  type="button"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((currentPage) =>
                      Math.min(currentPage + 1, totalPages)
                    )
                  }
                  type="button"
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function NoteDialog({
  habits,
  note,
  onSave,
  projects,
  tasks,
}: {
  habits: Array<{ id: string; title: string }>;
  note: Note;
  onSave: (data: {
    category?: string | null;
    content?: string;
    habitId?: string | null;
    projectId?: string | null;
    taskId?: string | null;
    title?: string;
  }) => void;
  projects: Array<{ id: string; title: string }>;
  tasks: Array<{ id: string; title?: string }>;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [category, setCategory] = useState(note.category ?? "");
  const [projectId, setProjectId] = useState(note.projectId ?? "none");
  const [habitId, setHabitId] = useState(note.habitId ?? "none");
  const [taskId, setTaskId] = useState(note.taskId ?? "none");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Eye className="h-4 w-4" />
          View / edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Note</DialogTitle>
          <DialogDescription>
            Read the full note, edit its content, and update linked records.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
            <Input
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
            <Input
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Category"
              value={category}
            />
          </div>
          <textarea
            className="min-h-72 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onChange={(event) => setContent(event.target.value)}
            value={content}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-full min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={habitId} onValueChange={setHabitId}>
              <SelectTrigger className="w-full min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No habit</SelectItem>
                {habits.map((habit) => (
                  <SelectItem key={habit.id} value={habit.id}>
                    {habit.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={taskId} onValueChange={setTaskId}>
              <SelectTrigger className="w-full min-w-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No task</SelectItem>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title ?? "Untitled task"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() =>
              onSave({
                category: category || null,
                content,
                habitId: habitId === "none" ? null : habitId,
                projectId: projectId === "none" ? null : projectId,
                taskId: taskId === "none" ? null : taskId,
                title,
              })
            }
            type="button"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
