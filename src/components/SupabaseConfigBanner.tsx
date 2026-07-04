import { isSupabaseConfigured } from '@/integrations/supabase/client';

export function SupabaseConfigBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center p-4">
      <div className="pointer-events-auto max-w-lg rounded-xl border border-amber-500/40 bg-amber-950/90 px-4 py-3 text-center text-sm text-amber-50 shadow-lg backdrop-blur">
        <p className="font-medium">Supabase is not configured for this deployment.</p>
        <p className="mt-1 text-amber-100/80">
          Add <code className="text-xs">VITE_SUPABASE_*</code> build variables and{' '}
          <code className="text-xs">SUPABASE_*</code> runtime variables in Cloudflare, then
          redeploy.
        </p>
      </div>
    </div>
  );
}
