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
import { GardenHUD } from "./GardenHUD";
import { computeGardenStats } from "@/lib/garden-energy";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";

type ThreadRow = { id: string; title: string; updated_at: string };

export function GardenChrome({
  energy,
  seeds,
  weather = "clear",
  inferredWeather = "clear",
  nightMode = false,
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
  energy: number;
  seeds: { thread_id: string | null; deleted_at?: string | null }[];
  weather?: GardenWeather;
  inferredWeather?: GardenWeather;
  nightMode?: boolean;
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
  const stats = computeGardenStats(energy, seeds);
  const hudWeather = weather !== "clear" ? weather : inferredWeather;

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-1.5 p-2 sm:gap-3 sm:p-4 md:p-5">
        <GardenHUD stats={stats} weather={hudWeather} nightMode={nightMode} />

        <div className="pointer-events-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Sheet open={threadsOpen} onOpenChange={onThreadsOpenChange}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Conversations"
                className="glass-button flex h-9 w-9 items-center justify-center rounded-full sm:h-auto sm:w-auto sm:px-4 sm:py-2"
              >
                <MessageCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden text-sm text-white/90 sm:inline">Conversations</span>
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
                            className="rounded-lg p-2 text-white/40 opacity-100 transition-all hover:bg-red-500/20 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove this conversation?</AlertDialogTitle>
                            <AlertDialogDescription>
                              The chat will be removed, but its flower stays in the garden as a numbered
                              memory. Your garden energy is kept — trees, butterflies, and huts do not
                              disappear.
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
            className="glass-button flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10"
          >
            <LogOut className="h-4 w-4 text-white/80" />
          </button>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-2 sm:bottom-6">
        <div className="glass-pill max-w-[calc(100vw-1rem)] px-3 py-2 text-center text-[10px] leading-snug text-white/55 sm:max-w-none sm:px-5 sm:py-2.5 sm:text-xs">
          {weather === "rainbow"
            ? "🌈 Rainbow over the horizon — drag to look behind the flowers"
            : weather === "rain"
              ? "🌧️ Gentle rain — fades soon; new feelings bring weather back"
              : inferredWeather === "rain"
                ? "Skies clearing — your garden still listens"
                : inferredWeather === "rainbow"
                  ? "Joy lingers in the air ✨"
                  : (
                    <>
                      <span className="hidden sm:inline">Drag to look around · scroll to zoom · tell jokes to water flowers</span>
                      <span className="sm:hidden">Drag to look · pinch to zoom</span>
                    </>
                  )}
        </div>
      </div>
    </>
  );
}
