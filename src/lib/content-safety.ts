export type ContentSafetyKind = "ok" | "crisis" | "sexual";

export type ContentSafetyResult =
  | { kind: "ok" }
  | { kind: "crisis"; reply: string }
  | { kind: "sexual"; reply: string };

const CRISIS_PATTERNS: RegExp[] = [
  /\b(kill|hurt|harm)\s+myself\b/i,
  /\bself[\s-]?harm\b/i,
  /\bsuicid(e|al)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bwish\s+i\s+(was|were)\s+dead\b/i,
  /\bend\s+my\s+life\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive)\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\boverdose\b/i,
  /\bcut(ting)?\s+myself\b/i,
];

const SEXUAL_PATTERNS: RegExp[] = [
  /\b(sex|sexy|sexual|nude|naked|porn|horny|orgasm|masturbat)/i,
  /\b(send\s+)?nudes?\b/i,
  /\b(blowjob|handjob|onlyfans|dick\s?pic|boobs?|tits)\b/i,
  /\b(f+u+c+k\s+me|suck\s+my)\b/i,
];

export const CRISIS_GARDENER_REPLY = `I'm glad you said something, but I'm only a gardener in a little app, not someone who can keep you safe.

If you're in the US, please call or text 988 (Suicide & Crisis Lifeline) or 911 if you're in immediate danger. If you're elsewhere, contact your local emergency number or crisis line.

You deserve real support from a person who can help.`;

export const SEXUAL_GARDENER_REPLY = `This garden's for feelings, jokes, and life stuff, not that kind of talk. I'll pretend I didn't hear it.

Got something else on your mind?`;

export function checkContentSafety(text: string): ContentSafetyResult {
  const normalized = text.trim();
  if (!normalized) return { kind: "ok" };

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(normalized)) return { kind: "crisis", reply: CRISIS_GARDENER_REPLY };
  }

  for (const pattern of SEXUAL_PATTERNS) {
    if (pattern.test(normalized)) return { kind: "sexual", reply: SEXUAL_GARDENER_REPLY };
  }

  return { kind: "ok" };
}
