const KEY = "garden-promo-seen";

export function hasSeenPromo(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(KEY) === "true";
}

export function markPromoSeen() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, "true");
}
