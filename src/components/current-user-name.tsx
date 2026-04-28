"use client";

import { useEffect, useState } from "react";

type AuthUser = {
  email: string;
  name: string | null;
};

function getDisplayName(user: AuthUser | null) {
  if (user?.name?.trim()) {
    return user.name.trim();
  }

  const emailPrefix = user?.email.split("@")[0]?.trim();
  if (emailPrefix) {
    return emailPrefix;
  }

  return "User";
}

export function CurrentUserName() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          signal: controller.signal,
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = (await response.json()) as AuthUser;
        setUser(data);
      } catch {
        if (!controller.signal.aborted) {
          setUser(null);
        }
      }
    };

    void loadUser();

    return () => {
      controller.abort();
    };
  }, []);

  return <>{getDisplayName(user)}</>;
}
