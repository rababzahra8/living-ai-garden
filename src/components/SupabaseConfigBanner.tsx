import { isSupabaseConfigured } from '@/integrations/supabase/client';

export function SupabaseConfigBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center p-2 sm:p-4">
      <div className="pointer-events-auto w-full max-w-lg rounded-xl border border-amber-500/40 bg-amber-950/90 px-3 py-2.5 text-center text-xs text-amber-50 shadow-lg backdrop-blur sm:px-4 sm:py-3 sm:text-sm">
        <p className="font-medium">Supabase is not configured for this deployment.</p>
        <p className="mt-1 text-pretty text-amber-100/80">
          Add <code className="break-all text-[10px] sm:text-xs">VITE_SUPABASE_*</code> build variables
          and <code className="break-all text-[10px] sm:text-xs">SUPABASE_*</code> runtime variables in
          Cloudflare, then redeploy.
        </p>
      </div>
    </div>
  );
}
