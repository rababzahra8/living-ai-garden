import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Leaf, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/garden", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/garden` },
        });
        if (error) throw error;
        toast.success("Welcome! Your garden is ready.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/garden", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm border-border/60 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Leaf className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            {mode === "signin" ? "Welcome back" : "Plant your first seed"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === "signin"
              ? "Return to your garden."
              : "Create an account to begin growing."}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Enter the garden" : "Create garden"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                No garden yet?{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already growing?{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/">← Back home</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
