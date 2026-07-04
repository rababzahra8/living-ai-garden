export function isEmailRateLimitError(error: unknown): boolean {
  const message = (
    error instanceof Error ? error.message : typeof error === "string" ? error : ""
  ).toLowerCase();

  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code).toLowerCase()
      : "";

  return (
    code === "over_email_send_rate_limit" ||
    message.includes("email rate limit") ||
    message.includes("over_email_send_rate_limit") ||
    (message.includes("rate limit") && message.includes("email"))
  );
}

export function formatAuthError(error: unknown): {
  message: string;
  suggestGoogle: boolean;
} {
  if (isEmailRateLimitError(error)) {
    return {
      message:
        "We've hit the email limit for now. Please sign in with Google instead — no confirmation email needed.",
      suggestGoogle: true,
    };
  }

  return {
    message: error instanceof Error ? error.message : "Something went wrong",
    suggestGoogle: false,
  };
}
