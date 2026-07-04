export function getAppOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return import.meta.env.VITE_APP_URL || 'http://localhost:8080';
}

/** Supabase password-reset links sometimes land on `/` with `?code=` instead of `/auth/reset-password`. */
export function redirectAuthCallbackToResetPassword(): void {
  if (typeof window === 'undefined') return;

  const { pathname, search, hash } = window.location;
  if (pathname !== '/') return;

  const params = new URLSearchParams(search);
  const hasCode = params.has('code');
  const hasRecoveryHash =
    hash.includes('type=recovery') || hash.includes('access_token');

  if (!hasCode && !hasRecoveryHash) return;

  const target = new URL('/auth/reset-password', window.location.origin);
  target.search = search;
  target.hash = hash;
  window.location.replace(target.toString());
}
