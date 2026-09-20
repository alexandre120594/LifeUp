"use client";

import { CheckCircle2, Inbox, NotebookText, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useCreateInboxItem,
  useDeleteInboxItem,
  useInboxItems,
  useUpdateInboxItem,
} from "@/hooks/useInboxMutations";
import type { InboxItemType } from "@/types/BaseInterfaces";

const inboxTypes: Array<{ label: string; value: InboxItemType }> = [
  { label: "Idea", value: "idea" },
  { label: "Note", value: "note" },
  { label: "Study", value: "study" },
  { label: "Finance", value: "finance" },
  { label: "Thought", value: "thought" },
];

export default function InboxPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<InboxItemType>("idea");
  const [status, setStatus] = useState("unprocessed");
  const { data: items = [], isLoading } = useInboxItems({ status });
  const createInboxItem = useCreateInboxItem();
  const updateInboxItem = useUpdateInboxItem();
  const deleteInboxItem = useDeleteInboxItem();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    createInboxItem.mutate(
      { content, title: title.trim(), type },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setType("idea");
        },
      }
    );
  }

  return (
    <DashboardViewport header={<MenuPageHeader eyebrow="Fast capture" title="Inbox" />}>
      <div className="grid min-h-0 gap-3 overflow-hidden lg:grid-cols-[minmax(18rem,0.42fr)_minmax(0,1fr)]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Inbox className="h-4 w-4" />
              Quick capture
            </CardTitle>
            <CardDescription>Independent inbox, no Goal link in this version.</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <form className="grid gap-2" onSubmit={handleSubmit}>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
              <textarea
                className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Details"
              />
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={type}
                onChange={(event) => setType(event.target.value as InboxItemType)}
              >
                {inboxTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <Button disabled={createInboxItem.isPending} type="submit">
                Capture
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex min-h-0 min-w-0 flex-col overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="shrink-0 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Inbox items</CardTitle>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="unprocessed">Unprocessed</option>
                <option value="processed">Processed</option>
                <option value="all">All</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 pt-0">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading inbox.</p>
            ) : items.length ? (
              items.map((item) => (
                <div className="grid gap-3 rounded-lg border border-border/70 p-3" key={item.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap gap-1">
                        <Badge>{item.status}</Badge>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      <h3 className="break-words font-semibold">{item.title}</h3>
                      {item.content ? (
                        <p className="break-words text-sm text-muted-foreground">{item.content}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
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
                        {item.status === "processed" ? "Reopen" : "Done"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateInboxItem.mutate({ id: item.id, data: { convertToNote: true } })}
                      >
                        <NotebookText className="h-4 w-4" />
                        Note
                      </Button>
                      <Button variant="outline" onClick={() => deleteInboxItem.mutate(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No inbox items.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardViewport>
  );
}
