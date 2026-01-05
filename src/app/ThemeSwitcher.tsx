"use client";

import React from "react";

// Dados extraídos da sua paleta de cores (Imagem 1)
const themes = {
  evergreen: { p: { h: "168.48", c: "0.157" }, s: { h: "172.44", c: "0.035" } },
  spruce:    { p: { h: "180.73", c: "0.139" }, s: { h: "181.45", c: "0.033" } },
  seafoam:   { p: { h: "138.00", c: "0.111" }, s: { h: "138.74", c: "0.010" } },
  turquoise: { p: { h: "184.05", c: "0.136" }, s: { h: "187.91", c: "0.031" } },
  skyblue:   { p: { h: "232.06", c: "0.125" }, s: { h: "226.81", c: "0.027" } }
};

export function ThemeSwitcher() {
  const changeTheme = (name: keyof typeof themes) => {
    const theme = themes[name];
    const root = document.documentElement;

    // Atualiza o DOM imediatamente
    root.style.setProperty("--p-hue", theme.p.h);
    root.style.setProperty("--p-chroma", theme.p.c);
    root.style.setProperty("--s-hue", theme.s.h);
    root.style.setProperty("--s-chroma", theme.s.c);

    // Salva a escolha
    localStorage.setItem("app-theme-choice", name);
  };

  return (
    <div className="flex gap-2 p-2 bg-white border rounded-full w-fit shadow-sm mx-auto">
      {Object.entries(themes).map(([key, value]) => (
        <button
          key={key}
          onClick={() => changeTheme(key as keyof typeof themes)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: `oklch(0.6 ${value.p.c} ${value.p.h})` }}
          />
          <span className="capitalize">{key}</span>
        </button>
      ))}
    </div>
  );
}