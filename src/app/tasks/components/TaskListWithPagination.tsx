"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, ListTodo } from "lucide-react";
import TaskItem from "./TaskItem";
import { Task } from "@/types/BaseInterfaces";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TaskListProps {
  tasks?: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const safeTasks = useMemo(
    () =>
      [...(tasks ?? [])].sort((a, b) => {
        if (Boolean(a.completed) !== Boolean(b.completed)) {
          return Number(a.completed) - Number(b.completed);
        }

        return (a.time ?? "99:99").localeCompare(b.time ?? "99:99");
      }),
    [tasks],
  );
  const pendingTasks = safeTasks.filter((task) => !task.completed).length;
  const completedTasks = safeTasks.length - pendingTasks;

  const totalPages = Math.ceil(safeTasks.length / itemsPerPage);
  const currentTaskPage = Math.min(currentPage, totalPages || 1);
  const startIndex = (currentTaskPage - 1) * itemsPerPage;
  const currentTasks = safeTasks.slice(startIndex, startIndex + itemsPerPage);
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, i) => i + 1,
  ).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentTaskPage) <= 1,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="border-b border-border/70 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-base font-semibold sm:text-lg">
              <ListTodo className="h-5 w-5 text-primary" />
              <h3 className="truncate">Task Queue</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Pending tasks stay first, then completed work.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm sm:flex">
            <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Total
              </div>
              <div className="mt-0.5 font-semibold">{safeTasks.length}</div>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2">
              <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                Open
              </div>
              <div className="mt-0.5 font-semibold">{pendingTasks}</div>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2">
              <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Done
              </div>
              <div className="mt-0.5 font-semibold">{completedTasks}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 p-3 sm:p-4">
        {currentTasks.length > 0 ? (
          currentTasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 bg-background/60 p-6 text-center text-sm text-muted-foreground">
            No tasks found.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentTaskPage} of {totalPages} / {safeTasks.length} tasks
          </p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent className="flex-wrap">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentTaskPage - 1);
                  }}
                  className={
                    currentTaskPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {pageNumbers.map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                    isActive={page === currentTaskPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentTaskPage + 1);
                  }}
                  className={
                    currentTaskPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </section>
  );
}
