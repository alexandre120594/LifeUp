"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

type DisplayMode = "light" | "dark";

const displayModeChangeEvent = "app-display-mode-change";

function getDisplayModeSnapshot(): DisplayMode {
  if (typeof window === "undefined") {
    return getServerDisplayModeSnapshot();
  }

  const savedMode = localStorage.getItem("app-display-mode");
  return savedMode === "dark" || savedMode === "night" ? "dark" : "light";
}

function getServerDisplayModeSnapshot(): DisplayMode {
  return "light";
}

function subscribeToDisplayModeChanges(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(displayModeChangeEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(displayModeChangeEvent, callback);
  };
}

function applyDisplayMode(mode: DisplayMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const displayMode = useSyncExternalStore(
    subscribeToDisplayModeChanges,
    getDisplayModeSnapshot,
    getServerDisplayModeSnapshot,
  );

  useEffect(() => {
    applyDisplayMode(displayMode);
  }, [displayMode]);

  const changeDisplayMode = (mode: DisplayMode) => {
    applyDisplayMode(mode);
    localStorage.setItem("app-display-mode", mode);
    window.dispatchEvent(new Event(displayModeChangeEvent));
  };

  return (
    <div
      aria-label="Tema da interface"
      className={cn("inline-flex rounded-[var(--r-10)] bg-secondary p-[3px]", className)}
      role="group"
    >
      {[
        { icon: Sun, label: "Usar tema claro", value: "light" as const },
        { icon: Moon, label: "Usar tema escuro", value: "dark" as const },
      ].map((mode) => {
        const Icon = mode.icon;
        const isActive = displayMode === mode.value;

        return (
          <button
            aria-label={mode.label}
            aria-pressed={isActive}
            className={cn(
              "flex size-[30px] items-center justify-center rounded-lg text-text-secondary transition-[background-color,color,box-shadow] duration-[var(--fast)] ease-[var(--ease)] hover:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40",
              isActive && "bg-panel text-foreground shadow-snow-1",
            )}
            key={mode.value}
            onClick={() => changeDisplayMode(mode.value)}
            title={mode.label}
            type="button"
          >
            <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
          </button>
        );
      })}
    </div>
  );
}

