import { LogOut, MessageCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";
import { GardenHUD, computeGardenStats } from "./GardenHUD";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";

type ThreadRow = { id: string; title: string; updated_at: string };

export function GardenChrome({
  seedsCount,
  weather = "clear",
  threads,
  threadsOpen,
  onThreadsOpenChange,
  onNewChat,
  onOpenThread,
  onDeleteThread,
  onSignOut,
  chatPending,
  deletePending,
}: {
  seedsCount: number;
  weather?: GardenWeather;
  threads: ThreadRow[];
  threadsOpen: boolean;
  onThreadsOpenChange: (open: boolean) => void;
  onNewChat: () => void;
  onOpenThread: (id: string) => void;
  onDeleteThread: (id: string) => void;
  onSignOut: () => void;
  chatPending: boolean;
  deletePending?: boolean;
}) {
  const stats = computeGardenStats(seedsCount);

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4 md:p-5">
        <GardenHUD stats={stats} weather={weather} />

        <div className="pointer-events-auto flex items-center gap-2">
          <Sheet open={threadsOpen} onOpenChange={onThreadsOpenChange}>
            <SheetTrigger asChild>
              <button type="button" className="glass-button rounded-full px-4 py-2 text-sm text-white/90">
                <MessageCircle className="mr-2 inline h-4 w-4" />
                Conversations
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-sheet w-full border-white/10 sm:max-w-sm">
              <SheetHeader>
                <SheetTitle className="text-white/90">Your conversations</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <Button
                  onClick={onNewChat}
                  disabled={chatPending}
                  className="w-full rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New conversation
                </Button>
              </div>
              <ScrollArea className="mt-4 h-[calc(100dvh-180px)] pr-2">
                <ul className="space-y-1">
                  {threads.map((t) => (
                    <li key={t.id} className="group flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenThread(t.id)}
                        className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/10"
                      >
                        <div className="line-clamp-1 font-medium text-white/90">{t.title}</div>
                        <div className="text-xs text-white/45">{new Date(t.updated_at).toLocaleString()}</div>
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Delete ${t.title}`}
                            disabled={deletePending}
                            className="rounded-lg p-2 text-white/40 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
                              onClick={() => onDeleteThread(t.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </li>
                  ))}
                  {threads.length === 0 && (
                    <li className="px-3 py-6 text-center text-sm text-white/45">
                      Talk to the gardener to plant your first seed.
                    </li>
                  )}
                </ul>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <ThemeToggle />
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="glass-button flex h-10 w-10 items-center justify-center rounded-full"
          >
            <LogOut className="h-4 w-4 text-white/80" />
          </button>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center">
        <div className="glass-pill px-5 py-2.5 text-xs text-white/55">
          {weather === "rainbow"
            ? "🌈 Rainbow over the horizon — drag to look behind the flowers"
            : "Drag to look around · scroll to zoom · tell jokes to water flowers"}
        </div>
      </div>
    </>
  );
}
