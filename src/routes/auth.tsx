import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { FlyingLeaves } from "@/components/auth/FlyingLeaves";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { ThemeToggle } from "@/components/theme-toggle";
import { ASYNC_TIMEOUT, getErrorMessage, withTimeout } from "@/lib/async-safe";
import { formatAuthError } from "@/lib/auth-errors";
import { AppLogo } from "@/components/AppLogo";

const authSearchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional().catch(undefined),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => authSearchSchema.parse(search),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { mode: modeFromUrl } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(modeFromUrl ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [suggestGoogle, setSuggestGoogle] = useState(false);

  useEffect(() => {
    if (modeFromUrl) setMode(modeFromUrl);
  }, [modeFromUrl]);

  const switchMode = (next: "signin" | "signup") => {
    setMode(next);
    navigate({ to: "/auth", search: { mode: next }, replace: true });
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    withTimeout(supabase.auth.getSession(), ASYNC_TIMEOUT.auth)
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else if (data.session) navigate({ to: "/garden", replace: true });
      })
      .catch((err) => toast.error(getErrorMessage(err, "Could not verify session")));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/garden", replace: true });
    });

    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!googleLoading) return;
    const timer = setTimeout(() => {
      setGoogleLoading(false);
      toast.error("Google sign-in did not start. Check Google provider settings in Supabase.");
    }, ASYNC_TIMEOUT.oauth);
    return () => clearTimeout(timer);
  }, [googleLoading]);

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not start Google sign-in";
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuggestGoogle(false);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/garden` },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email to confirm your account, then sign in.");
          switchMode("signin");
          return;
        }
        toast.success("Welcome! Your garden is ready.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) {
          throw new Error("Sign-in succeeded but no session was created. Confirm your email first.");
        }
      }
      navigate({ to: "/garden", replace: true });
    } catch (err) {
      const { message, suggestGoogle: useGoogle } = formatAuthError(err);
      setSuggestGoogle(useGoogle);
      toast.error(message, { duration: useGoogle ? 8000 : 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen relative flex min-h-screen items-center justify-center px-4 py-10">
      <FlyingLeaves />

      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="auth-panel relative z-10 w-full max-w-sm rounded-2xl border border-border/50 bg-card/90 p-6 shadow-lg backdrop-blur-sm">
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <AppLogo size={48} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {mode === "signin" ? "Welcome back" : "Join the garden"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to continue growing." : "Create an account to get started."}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className={`rounded-full py-1.5 text-sm font-medium transition-colors ${
              mode === "signin"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`rounded-full py-1.5 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign up
          </button>
        </div>

        <GoogleSignInButton
          loading={googleLoading}
          disabled={loading}
          onClick={signInWithGoogle}
        />

        {suggestGoogle && (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-900 dark:text-amber-100">
            Email sign-up is paused for now. Use <strong>Continue with Google</strong> above to
            enter the garden instantly.
          </p>
        )}

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card/90 px-2 text-muted-foreground">or with email</span>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Input
            id="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl bg-background/80"
          />
          <PasswordInput
            id="password"
            placeholder="Password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-xl bg-background/80"
          />

          {mode === "signin" && (
            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          <Button type="submit" className="mt-1 h-11 w-full rounded-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Enter the garden" : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              No garden yet?{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => switchMode("signup")}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already growing?{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => switchMode("signin")}
              >
                Sign in
              </button>
            </>
          )}
        </p>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground hover:underline">
            ← Back home
          </Link>
        </p>
      </div>
    </div>
  );
}
