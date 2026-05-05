"use client";

import {
  Archive,
  CheckCircle2,
  Eye,
  Inbox,
  Lightbulb,
  Link2,
  NotebookText,
  Trash2,
} from "lucide-react";
import { FormEvent, useState } from "react";
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
  useCreateInboxItem,
  useDeleteInboxItem,
  useInboxItems,
  useUpdateInboxItem,
} from "@/hooks/useInboxMutations";
import { useHabit } from "@/hooks/useHabitMutations";
import { useProjects } from "@/hooks/useProjectMutations";
import { useTask } from "@/hooks/useTaskMutation";
import type { InboxItem, InboxItemType } from "@/types/BaseInterfaces";

const inboxPageSize = 5;

const inboxTypes: Array<{ label: string; value: InboxItemType }> = [
  { label: "Idea", value: "idea" },
  { label: "Task", value: "task" },
  { label: "Note", value: "note" },
  { label: "Study", value: "study" },
  { label: "Finance", value: "finance" },
  { label: "Habit", value: "habit" },
  { label: "Project", value: "project" },
  { label: "Thought", value: "thought" },
];

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function LinkedEntityLabel({ item }: { item: InboxItem }) {
  const links = [
    item.project?.title ? `Project: ${item.project.title}` : "",
    item.habit?.title ? `Habit: ${item.habit.title}` : "",
    item.task?.title ? `Task: ${item.task.title}` : "",
    item.note?.title ? `Note: ${item.note.title}` : "",
  ].filter(Boolean);

  return (
    <span className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
      {links.length ? links.join(" / ") : "No link yet"}
    </span>
  );
}

export default function InboxPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<InboxItemType>("idea");
  const [statusFilter, setStatusFilter] = useState("unprocessed");
  const [page, setPage] = useState(1);
  const { data: items, isLoading } = useInboxItems({ status: statusFilter });
  const { data: projects } = useProjects();
  const { data: habits } = useHabit();
  const { data: tasks } = useTask();
  const createInboxItem = useCreateInboxItem();
  const updateInboxItem = useUpdateInboxItem();
  const deleteInboxItem = useDeleteInboxItem();

  const unprocessedCount =
    items?.filter((item) => item.status === "unprocessed").length ?? 0;
  const linkedCount =
    items?.filter(
      (item) => item.projectId || item.habitId || item.taskId || item.noteId
    ).length ?? 0;
  const totalPages = Math.max(Math.ceil((items?.length ?? 0) / inboxPageSize), 1);
  const visibleItems = (items ?? []).slice(
    (page - 1) * inboxPageSize,
    page * inboxPageSize
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    createInboxItem.mutate(
      {
        content,
        title: title.trim(),
        type,
      },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setType("idea");
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <MenuPageHeader eyebrow="Fast capture" title="Inbox" />

      <OverviewPanel
        title="Capture now, organize later"
        description="Drop raw ideas, reminders, study topics, and loose work here before assigning them to projects, habits, tasks, or notes."
        stats={[
          { label: "Visible items", value: items?.length ?? 0, icon: Inbox },
          {
            label: "Unprocessed",
            value: unprocessedCount,
            icon: Archive,
          },
          { label: "Linked", value: linkedCount, icon: Link2 },
        ]}
        progress={{
          detail: `${linkedCount} items already connected`,
          icon: CheckCircle2,
          label: "Processing",
          value: items?.length ? Math.round((linkedCount / items.length) * 100) : 0,
        }}
        focusTitle="Keep capture lightweight"
        focusDescription="Use the quick actions below to connect an item to existing work or turn it into a permanent note."
        focusItems={[
          { label: "Projects", value: projects?.length ?? 0, icon: Lightbulb },
          { label: "Notes-ready", value: items?.length ?? 0, icon: NotebookText },
        ]}
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Quick capture</CardTitle>
          <CardDescription>
            Save unorganized information before deciding where it belongs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 lg:grid-cols-[1fr_160px_auto]" onSubmit={handleSubmit}>
            <div className="grid min-w-0 gap-2">
              <Input
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Study TCP sliding window"
                value={title}
              />
              <textarea
                className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onChange={(event) => setContent(event.target.value)}
                placeholder="Optional details"
                value={content}
              />
            </div>
            <Select value={type} onValueChange={(value) => setType(value as InboxItemType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {inboxTypes.map((itemType) => (
                  <SelectItem key={itemType.value} value={itemType.value}>
                    {itemType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button disabled={createInboxItem.isPending} type="submit">
              Capture
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Inbox items</CardTitle>
            <CardDescription>
              Process temporary items into structured work.
            </CardDescription>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unprocessed">Unprocessed</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoading ? (
            <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
              Loading inbox items...
            </p>
          ) : items?.length ? (
            visibleItems.map((item) => (
              <div
                className="grid min-w-0 gap-3 rounded-lg border border-border/70 bg-background/70 p-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]"
                key={item.id}
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.status === "processed" ? "secondary" : "default"}>
                      {item.status}
                    </Badge>
                    <Badge variant="outline">{item.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <h3 className="break-words text-base font-semibold [overflow-wrap:anywhere]">
                    {item.title}
                  </h3>
                  {item.content ? (
                    <p className="break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
                      {item.content}
                    </p>
                  ) : null}
                  <LinkedEntityLabel item={item} />
                </div>

                <div className="grid min-w-0 gap-2">
                  <div className="flex flex-wrap gap-2">
                    <InboxItemDialog
                      item={item}
                      projects={projects ?? []}
                      habits={habits ?? []}
                      tasks={tasks ?? []}
                      onSave={(data) =>
                        updateInboxItem.mutate({ id: item.id, data })
                      }
                    />
                    <Button
                      onClick={() =>
                        updateInboxItem.mutate({
                          id: item.id,
                          data: { convertToNote: true },
                        })
                      }
                      type="button"
                      variant="secondary"
                    >
                      <NotebookText className="h-4 w-4" />
                      Convert to note
                    </Button>
                    <Button
                      onClick={() =>
                        updateInboxItem.mutate({
                          id: item.id,
                          data: {
                            status:
                              item.status === "processed"
                                ? "unprocessed"
                                : "processed",
                          },
                        })
                      }
                      type="button"
                      variant="outline"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {item.status === "processed" ? "Reopen" : "Done"}
                    </Button>
                    <Button
                      onClick={() => deleteInboxItem.mutate(item.id)}
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-lg bg-secondary/35 p-4 text-sm text-muted-foreground">
              No inbox items in this view.
            </p>
          )}
          {items?.length ? (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages} / {items.length} items
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

function InboxItemDialog({
  habits,
  item,
  onSave,
  projects,
  tasks,
}: {
  habits: Array<{ id: string; title: string }>;
  item: InboxItem;
  onSave: (data: {
    content?: string | null;
    habitId?: string | null;
    projectId?: string | null;
    status?: "processed" | "unprocessed";
    taskId?: string | null;
    title?: string;
    type?: InboxItemType;
  }) => void;
  projects: Array<{ id: string; title: string }>;
  tasks: Array<{ id: string; title?: string }>;
}) {
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content ?? "");
  const [type, setType] = useState<InboxItemType>(item.type);
  const [status, setStatus] = useState(item.status);
  const [projectId, setProjectId] = useState(item.projectId ?? "none");
  const [habitId, setHabitId] = useState(item.habitId ?? "none");
  const [taskId, setTaskId] = useState(item.taskId ?? "none");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Eye className="h-4 w-4" />
          View / edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inbox item</DialogTitle>
          <DialogDescription>
            Review the captured item and connect it to existing work.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Input
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
          <textarea
            className="min-h-40 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onChange={(event) => setContent(event.target.value)}
            placeholder="Details"
            value={content}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={type} onValueChange={(value) => setType(value as InboxItemType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {inboxTypes.map((itemType) => (
                  <SelectItem key={itemType.value} value={itemType.value}>
                    {itemType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as "processed" | "unprocessed")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unprocessed">Unprocessed</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                content,
                habitId: habitId === "none" ? null : habitId,
                projectId: projectId === "none" ? null : projectId,
                status,
                taskId: taskId === "none" ? null : taskId,
                title,
                type,
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
