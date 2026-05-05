"use client";

import { useState } from "react";
import TaskItem from "./TaskItem"; // Your existing component
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
  const safeTasks = [...(tasks ?? [])].sort((a, b) => {
    return Number(a.completed) - Number(b.completed);
  });

  const totalPages = Math.ceil(safeTasks.length / itemsPerPage);
  const currentTaskPage = Math.min(currentPage, totalPages || 1);
  const startIndex = (currentTaskPage - 1) * itemsPerPage;
  const currentTasks = safeTasks.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-w-0 space-y-4">
      <div className="min-h-max min-w-0 overflow-hidden rounded-lg border bg-card/80 p-2 shadow-sm">
        <h4 className="scroll-m-20 p-3 text-lg font-medium sm:p-4 sm:text-xl">
          Task Queue
        </h4>
        {currentTasks.length > 0 ? (
          currentTasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <p className="p-4 text-center text-muted-foreground">No tasks found.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
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

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
    </div>
  );
}
