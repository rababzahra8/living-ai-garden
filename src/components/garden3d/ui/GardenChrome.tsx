import { History, LogOut, Move, Sparkles, Trash2, Volume2, VolumeX } from "lucide-react";
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
import { WEATHER_LABELS, type GardenWeather, type MoodBoost } from "@/lib/garden3d/garden-weather";
import type { WeatherPreference } from "@/lib/garden3d/weather-preferences";
import { WeatherPicker } from "./WeatherPicker";

type ThreadRow = { id: string; title: string; updated_at: string };

export function GardenChrome({
  energy,
  seeds,
  weather = "clear",
  inferredMood = "clear",
  weatherPreference = "auto",
  onWeatherPreferenceChange,
  nightMode = false,
  threads,
  threadsOpen,
  onThreadsOpenChange,
  onChatWithGardener,
  onNewChat,
  onOpenThread,
  onDeleteThread,
  onSignOut,
  chatPending,
  deletePending,
  arrangeMode = false,
  onArrangeModeChange,
  audioMuted = false,
  onAudioToggle,
}: {
  energy: number;
  seeds: { thread_id: string | null; deleted_at?: string | null }[];
  weather?: GardenWeather;
  inferredMood?: MoodBoost;
  weatherPreference?: WeatherPreference;
  onWeatherPreferenceChange?: (pref: WeatherPreference) => void;
  nightMode?: boolean;
  threads: ThreadRow[];
  threadsOpen: boolean;
  onThreadsOpenChange: (open: boolean) => void;
  onChatWithGardener: () => void;
  onNewChat: () => void;
  onOpenThread: (id: string) => void;
  onDeleteThread: (id: string) => void;
  onSignOut: () => void;
  chatPending: boolean;
  deletePending?: boolean;
  arrangeMode?: boolean;
  onArrangeModeChange?: (on: boolean) => void;
  audioMuted?: boolean;
  onAudioToggle?: () => void;
}) {
  const stats = computeGardenStats(energy, seeds);
  const wx = WEATHER_LABELS[weather];
  const hudWeather = weather !== "clear" || weatherPreference !== "auto" ? weather : inferredMood === "rain" ? "rain" : inferredMood === "spring" ? "spring" : "clear";

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-1.5 p-2 sm:gap-3 sm:p-4 md:p-5">
        <GardenHUD stats={stats} weather={hudWeather} nightMode={nightMode} weatherPreference={weatherPreference} />

        <div className="pointer-events-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Sheet open={threadsOpen} onOpenChange={onThreadsOpenChange}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Past conversations"
                className="glass-button flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10"
                title="Past conversations"
              >
                <History className="h-4 w-4 text-white/80" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-sheet w-full border-white/10 sm:max-w-sm">
              <SheetHeader>
                <SheetTitle className="text-white/90">Past conversations</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <Button
                  onClick={onNewChat}
                  disabled={chatPending}
                  variant="outline"
                  className="w-full rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  Start a new thread
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
                              The chat will be removed. A numbered stone replaces the flower in your garden.
                              Your energy is kept.
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
                    <li className="px-3 py-4 text-center text-sm text-white/45">
                      Talk to the gardener to plant your first seed.
                    </li>
                  )}
                </ul>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          {onArrangeModeChange && (
            <button
              type="button"
              aria-label="Arrange garden"
              onClick={() => onArrangeModeChange(!arrangeMode)}
              className={`glass-button flex h-9 w-9 items-center justify-center rounded-full sm:h-auto sm:w-auto sm:px-4 sm:py-2 ${
                arrangeMode ? "ring-2 ring-emerald-400/60" : ""
              }`}
            >
              <Move className="h-4 w-4 sm:mr-2" />
              <span className="hidden text-sm text-white/90 sm:inline">
                {arrangeMode ? "Done" : "Arrange"}
              </span>
            </button>
          )}
          {onWeatherPreferenceChange && (
            <WeatherPicker value={weatherPreference} onChange={onWeatherPreferenceChange} />
          )}
          {onAudioToggle && (
            <button
              type="button"
              aria-label={audioMuted ? "Unmute garden ambience" : "Mute garden ambience"}
              onClick={onAudioToggle}
              className="glass-button flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10"
            >
              {audioMuted ? (
                <VolumeX className="h-4 w-4 text-white/80" />
              ) : (
                <Volume2 className="h-4 w-4 text-white/80" />
              )}
            </button>
          )}
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

      {!arrangeMode && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 z-20 flex justify-center px-4 sm:bottom-20">
          <button
            type="button"
            disabled={chatPending}
            onClick={onChatWithGardener}
            className="pointer-events-auto glass-button-primary flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold shadow-lg shadow-emerald-900/30 sm:px-8 sm:text-base"
          >
            <Sparkles className="h-5 w-5" />
            {chatPending ? "Opening chat…" : "Chat with the Gardener"}
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-2 sm:bottom-6">
        <div className="glass-pill max-w-[calc(100vw-1rem)] px-3 py-2 text-center text-[10px] leading-snug text-white/55 sm:max-w-none sm:px-5 sm:py-2.5 sm:text-xs">
          {weatherPreference !== "auto" ? (
            <>
              {wx.icon} Locked to {wx.label.toLowerCase()}. Tap {wx.icon} to switch or auto cycle.
            </>
          ) : weather === "rain" ? (
            <>
              {wx.icon} {wx.label}
              {inferredMood === "rain" ? " from your chats" : ""}. Cycles through seasons on its own.
            </>
          ) : inferredMood === "spring" && weather === "spring" ? (
            "Warm spring light from joyful chats. Weather cycles through the day."
          ) : (
            <>
              <span className="hidden sm:inline">Weather cycles spring → summer → autumn → winter → rain. Drag to look around.</span>
              <span className="sm:hidden">Seasons cycle automatically. Drag to look around.</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}
