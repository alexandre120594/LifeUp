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

export function HabitList({ habits, colorHabit, onHabitClick }: { habits?: Habit[], colorHabit?: string, onHabitClick: (id: string) => void }) {
  if (!habits) {
    return;
  }
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(habits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHabits = habits.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  return (
    <div className="space-y-4">
      {/* The List */}
      <div className="grid md:grid-cols-3 gap-3">
        {currentHabits.map((habit) => (
          <HabitItem
            key={habit.id}
            habit={habit}
            NameProject={""}
            colorHabit={colorHabit}
            onClickHabit={(id) => { console.log("2. List Received", id); onHabitClick(id); }}
          />
        ))}
      </div>

      {/* Shadcn Pagination Controls */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
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
      )}
    </div>
  );
}
