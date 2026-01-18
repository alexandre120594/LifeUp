// src/hooks/usePomodoroTimer.ts
"use client";

import { useEffect, useState } from "react";

export function usePomodoroTimer(
  initialSeconds: number,
  onFinish: () => void
) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          onFinish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  return {
    secondsLeft,
    running,
    forceReset: (newSeconds: number) => {
    setRunning(false);
    setSecondsLeft(newSeconds);
  },
    start: () => setRunning(!running),
    stop: () => setRunning(false),
    reset: () => setSecondsLeft(initialSeconds),
  };
}
