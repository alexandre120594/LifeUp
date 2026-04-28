"use client";

import { useEffect, useSyncExternalStore } from "react";

const themes = {
  grove: {
    label: "Grove",
    p: { h: "156", c: "0.118" },
    s: { h: "104", c: "0.038" },
    a: { h: "34", c: "0.132" },
  },
  harbor: {
    label: "Harbor",
    p: { h: "224", c: "0.112" },
    s: { h: "188", c: "0.044" },
    a: { h: "42", c: "0.135" },
  },
  ember: {
    label: "Ember",
    p: { h: "24", c: "0.118" },
    s: { h: "82", c: "0.035" },
    a: { h: "188", c: "0.092" },
  },
  berry: {
    label: "Berry",
    p: { h: "350", c: "0.108" },
    s: { h: "42", c: "0.04" },
    a: { h: "170", c: "0.088" },
  },
  graphite: {
    label: "Graphite",
    p: { h: "250", c: "0.038" },
    s: { h: "182", c: "0.03" },
    a: { h: "32", c: "0.12" },
  },
};

type ThemeName = keyof typeof themes;

const themeChangeEvent = "app-theme-choice-change";

function getThemeSnapshot(): ThemeName {
  if (typeof window === "undefined") {
    return getServerThemeSnapshot();
  }

  const saved = localStorage.getItem("app-theme-choice");
  return saved && saved in themes ? (saved as ThemeName) : "grove";
}

function getServerThemeSnapshot(): ThemeName {
  return "grove";
}

function subscribeToThemeChanges(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(themeChangeEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(themeChangeEvent, callback);
  };
}

function applyTheme(name: ThemeName) {
  const theme = themes[name];
  const root = document.documentElement;

  root.style.setProperty("--p-hue", theme.p.h);
  root.style.setProperty("--p-chroma", theme.p.c);
  root.style.setProperty("--s-hue", theme.s.h);
  root.style.setProperty("--s-chroma", theme.s.c);
  root.style.setProperty("--a-hue", theme.a.h);
  root.style.setProperty("--a-chroma", theme.a.c);
}

export function ThemeSwitcher() {
  const activeTheme = useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  const changeTheme = (name: ThemeName) => {
    applyTheme(name);
    localStorage.setItem("app-theme-choice", name);
    window.dispatchEvent(new Event(themeChangeEvent));
  };

  return (
    <div className="flex w-fit gap-1 rounded-lg border bg-card/90 p-1 shadow-sm backdrop-blur">
      {Object.entries(themes).map(([key, value]) => (
        <button
          key={key}
          onClick={() => changeTheme(key as ThemeName)}
          className={`group flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:border-border hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:px-2.5 ${
            activeTheme === key
              ? "border-primary bg-secondary text-foreground"
              : "border-transparent"
          }`}
          title={value.label}
          aria-label={`Use ${value.label} theme`}
        >
          <span
            className="h-4 w-4 rounded-full ring-2 ring-background"
            style={{
              backgroundColor: `oklch(0.52 ${value.p.c} ${value.p.h})`,
            }}
          />
          <span className="ml-2 hidden text-xs font-medium text-muted-foreground group-hover:text-foreground lg:inline">
            {value.label}
          </span>
        </button>
      ))}
    </div>
  );
}
