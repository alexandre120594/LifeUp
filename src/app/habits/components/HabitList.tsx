"use client";
import React, { useState } from "react";
import HabitItem from "./HabitItem";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Habit } from "@/types/BaseInterfaces";

export function HabitList({
  habits,
  colorHabit,
  onHabitClick,
}: {
  habits?: Habit[];
  colorHabit?: string;
  onHabitClick: (id: string) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const safeHabits = habits ?? [];

  const totalPages = Math.ceil(safeHabits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHabits = safeHabits.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  return (
    <div className="min-w-0 space-y-4">
      <div className="grid min-w-0 gap-3 lg:grid-cols-2">
        {currentHabits.map((habit) => (
          <HabitItem
            key={habit.id}
            habit={habit}
            NameProject={""}
            colorHabit={colorHabit}
            onClickHabit={(id) => onHabitClick(id)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} / {safeHabits.length} habits
          </p>
          <Pagination className="mx-0 w-auto">
          <PaginationContent className="flex-wrap">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages)
                    handlePageChange(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
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
