import { Info } from "lucide-react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ENERGY_JOKE_BONUS,
  ENERGY_PER_MESSAGE,
  ENERGY_PER_NEW_FLOWER,
} from "@/lib/garden-energy";

function GuideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-sm font-semibold text-white/95">{title}</h3>
      <div className="text-sm leading-relaxed text-white/70">{children}</div>
    </section>
  );
}

export function GardenGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="How the garden works"
          title="How it works"
          className="flex h-7 shrink-0 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:px-2"
        >
          <Info className="h-3.5 w-3.5" />
          <span className="hidden text-[10px] font-medium sm:inline">Details</span>
        </button>
      </DialogTrigger>
      <DialogContent className="glass-sheet max-h-[min(85dvh,640px)] max-w-md border-white/15 bg-slate-950/95 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white">How your garden works</DialogTitle>
          <DialogDescription className="text-white/55">
            Chat with the Gardener — your meadow grows from what you share.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85dvh-8rem)] pr-3">
          <div className="space-y-5 pb-1">
            <GuideSection title="🌸 Flowers">
              <p>
                Each conversation plants a flower. Its <strong className="text-white/90">species and color</strong>{" "}
                reflect the mood of your chat — happy talks might bloom sunflowers; heavier ones, softer blues.
              </p>
              <p className="mt-2">
                Flowers <strong className="text-white/90">grow</strong> as you message (seed → sprout → bud → bloom).
                Tell a <strong className="text-white/90">joke</strong> to water yours for a bigger growth boost.
              </p>
            </GuideSection>

            <GuideSection title="✨ Energy">
              <ul className="list-inside list-disc space-y-1 marker:text-white/40">
                <li>
                  <strong className="text-white/90">+{ENERGY_PER_NEW_FLOWER}</strong> when a new flower is planted
                </li>
                <li>
                  <strong className="text-white/90">+{ENERGY_PER_MESSAGE}</strong> per message you send
                </li>
                <li>
                  <strong className="text-white/90">+{ENERGY_JOKE_BONUS}</strong> bonus when a joke waters a flower
                </li>
              </ul>
              <p className="mt-2">
                Energy <strong className="text-white/90">never goes down</strong> when you delete a chat — it only goes
                up as you tend the garden.
              </p>
            </GuideSection>

            <GuideSection title="🌱 Garden level">
              <p>
                Level rises as energy stacks up — roughly every <strong className="text-white/90">25 energy</strong>.
                Higher levels mean a lusher, more lived-in meadow.
              </p>
            </GuideSection>

            <GuideSection title="🌳 Trees, butterflies & huts">
              <p>More energy unlocks scenery around your flowers:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 marker:text-white/40">
                <li>
                  <strong className="text-white/90">Trees</strong> — more appear as energy grows
                </li>
                <li>
                  <strong className="text-white/90">Butterflies</strong> — drift in with higher energy
                </li>
                <li>
                  <strong className="text-white/90">Huts</strong> — up to 5 little houses at the edges (every ~35
                  energy)
                </li>
              </ul>
            </GuideSection>

            <GuideSection title="🌧️ Weather & sky">
              <p>
                Weather cycles through spring, summer, autumn, winter, and rain on its own. Joyful chats can
                bring a brief spring glow; heavier ones may bring rain that fades. Tap the weather button (top right) to
                lock a season or return to auto cycle.
              </p>
              <p className="mt-2">Toggle dark mode for a starry night, moon phases, aurora, and warm lights on the cottage, trees, and huts.</p>
            </GuideSection>

            <GuideSection title="🪨 Stones">
              <p>
                Deleting a conversation removes the chat but leaves a <strong className="text-white/90">numbered
                stone</strong> where the flower grew — a memory marker. Your energy and other garden growth stay.
              </p>
            </GuideSection>

            <GuideSection title="↔️ Arrange">
              <p>
                Tap <strong className="text-white/90">Arrange</strong>, then drag{" "}
                <strong className="text-white/90">flowers</strong> (green ring),{" "}
                <strong className="text-white/90">trees</strong> (purple ring), and{" "}
                <strong className="text-white/90">huts</strong> (gold ring). Tap{" "}
                <strong className="text-white/90">Done</strong> to save — tree and hut spots are remembered on this
                device.
              </p>
            </GuideSection>

            <GuideSection title="🔊 Garden sound">
              <p>
                Gentle birdsong plays in the background, with rain sounds when the weather is rainy. Use the speaker
                button (top right) to mute or unmute. Your choice is saved in this browser.
              </p>
            </GuideSection>

            <GuideSection title="💬 Tips">
              <ul className="list-inside list-disc space-y-1 marker:text-white/40">
                <li>Click the gardener or <strong className="text-white/90">New conversation</strong> to start chatting</li>
                <li>Drag to look around · scroll or pinch to zoom</li>
                <li>The Gardener keeps replies short — share feelings, ask things, or tell jokes</li>
              </ul>
            </GuideSection>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
