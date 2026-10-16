"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { CurrentUser } from "@/types/CurrentUser";

function getDisplayName(user: CurrentUser | null) {
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
  const { data: user } = useCurrentUser();

  return <>{getDisplayName(user ?? null)}</>;
}
