import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Droplets, Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { deleteThread, sendGardenerMessage } from "@/lib/chat.functions";
import { WATERING_HINTS } from "@/lib/water-jokes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";
import { GardenBackdrop } from "@/components/garden/GardenBackdrop";
import { LoadErrorPanel } from "@/components/LoadErrorPanel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type MessageRow = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

const GROWTH_LABELS = ["seed", "sprout", "bud", "bloom"] as const;
const MAX_GROWTH = 3;

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const sendFn = useServerFn(sendGardenerMessage);
  const deleteThreadFn = useServerFn(deleteThread);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wateringHint = WATERING_HINTS[threadId.charCodeAt(0) % WATERING_HINTS.length];

  const messagesQ = useQuery({
    queryKey: ["messages", threadId],
    queryFn: async (): Promise<MessageRow[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as MessageRow[];
    },
    retry: 1,
  });

  const seedQ = useQuery({
    queryKey: ["seed", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seeds")
        .select("growth")
        .eq("thread_id", threadId)
        .maybeSingle();
      if (error) throw error;
      return data as { growth: number } | null;
    },
    retry: 1,
  });

  const send = useMutation({
    mutationFn: async (content: string) => sendFn({ data: { threadId, content } }),
    onMutate: async (content) => {
      await qc.cancelQueries({ queryKey: ["messages", threadId] });
      const prev = qc.getQueryData<MessageRow[]>(["messages", threadId]) ?? [];
      const optimistic: MessageRow = {
        id: `tmp-${Date.now()}`,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };
      qc.setQueryData<MessageRow[]>(["messages", threadId], [...prev, optimistic]);
      setInput("");
      return { prev };
    },
    onSuccess: (result) => {
      if (result.watered) {
        const stage = GROWTH_LABELS[result.growth] ?? "growing";
        toast.success(`Flower watered! Now a ${stage} 💧`, {
          description: result.growth >= MAX_GROWTH ? "Your flower is in full bloom!" : "Keep telling jokes to help it bloom.",
        });
      }
      qc.setQueryData(["seed", threadId], { growth: result.growth });
    },
    onError: (err, _c, ctx) => {
      if (ctx?.prev) qc.setQueryData(["messages", threadId], ctx.prev);
      toast.error(err instanceof Error ? err.message : "Message failed");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["messages", threadId] });
      qc.invalidateQueries({ queryKey: ["seeds"] });
      qc.invalidateQueries({ queryKey: ["threads"] });
      qc.invalidateQueries({ queryKey: ["seed", threadId] });
      requestAnimationFrame(() => inputRef.current?.focus());
    },
  });

  const remove = useMutation({
    mutationFn: async () => deleteThreadFn({ data: { threadId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      qc.invalidateQueries({ queryKey: ["seeds"] });
      toast.success("Conversation removed from the garden");
      navigate({ to: "/garden" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete"),
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messagesQ.data, send.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v || send.isPending) return;
    send.mutate(v);
  };

  const messages = messagesQ.data ?? [];
  const isEmpty = messages.length === 0;
  const growth = seedQ.data?.growth ?? 0;
  const growthLabel = GROWTH_LABELS[growth] ?? "seed";

  return (
    <div className="relative flex h-[100dvh] flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <GardenBackdrop />
      </div>

      <header className="relative z-10 flex items-center justify-between border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-md">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link to="/garden">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to garden
          </Link>
        </Button>
        <div className="flex flex-col items-center gap-0.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            The Gardener
          </div>
          {growth > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Droplets className="h-3 w-3 text-sky-500" />
              Flower: {growthLabel}
              {growth < MAX_GROWTH && " · tell jokes to water it"}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-destructive"
                aria-label="Delete conversation"
                disabled={remove.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this conversation?</AlertDialogTitle>
                <AlertDialogDescription>
                  Its flower will wilt and disappear from your garden. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => remove.mutate()}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ThemeToggle />
        </div>
      </header>

      <ScrollArea className="relative z-10 flex-1">
        <div ref={scrollRef} className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8">
          {messagesQ.isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading conversation…
            </div>
          )}
          {messagesQ.isError && (
            <LoadErrorPanel
              message={
                messagesQ.error instanceof Error
                  ? messagesQ.error.message
                  : "Could not load this conversation"
              }
              onRetry={() => messagesQ.refetch()}
            />
          )}
          {!messagesQ.isLoading && !messagesQ.isError && isEmpty && (
            <div className="mx-auto max-w-md py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold">Hello, friend.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell me what's on your mind. Whatever we talk about, I'll plant a seed
                for it in your garden.
              </p>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-sky-600 dark:text-sky-400">
                <Droplets className="h-4 w-4 shrink-0" />
                {wateringHint}
              </p>
            </div>
          )}
          {!messagesQ.isLoading &&
            !messagesQ.isError &&
            messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ))}
          {send.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              The gardener is thinking…
            </div>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 border-t border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Share a thought or tell a joke to water your flower…"
            rows={1}
            className="min-h-[44px] resize-none rounded-2xl"
            disabled={send.isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={send.isPending || !input.trim()}
            className="h-11 w-11 shrink-0 rounded-full"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="max-w-[85%] whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {content}
      </div>
    </div>
  );
}
