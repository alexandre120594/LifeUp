export function isMissingSavingsContributionsTableError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as { code?: unknown; message?: unknown };
  const code = typeof candidate.code === "string" ? candidate.code : "";
  const message =
    typeof candidate.message === "string" ? candidate.message : "";

  return (
    code === "P2021" ||
    code === "P2022" ||
    (message.includes("SavingsContribution") &&
      (message.includes("does not exist") || message.includes("not exist")))
  );
}
