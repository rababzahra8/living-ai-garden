/** Strip em/en dashes from gardener replies for cleaner chat copy. */
export function withoutConversationDashes(text: string): string {
  return text
    .replace(/\s*—\s*/g, ". ")
    .replace(/\s*–\s*/g, ", ")
    .replace(/,\s*\./g, ".")
    .replace(/\.\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}
