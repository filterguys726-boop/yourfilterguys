export function isMissingFitmentEnabledColumn(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? String(error.code ?? "") : "";
  const message = "message" in error ? String(error.message ?? "") : "";

  return (
    code === "42703" ||
    (code === "PGRST204" && message.includes("fitment_enabled"))
  );
}
