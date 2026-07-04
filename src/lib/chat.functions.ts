import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { inferFlowerFromConversation, formatSeedSpecies } from "@/lib/flower-mood";
import { isWateringJoke } from "@/lib/water-jokes";

const SYSTEM_PROMPT = `You are the Gardener — a warm, patient, and quietly wise guide who tends a small living garden that grows alongside your conversations with the visitor.

Speak gently and briefly. Reply in 1-3 short paragraphs. Use plain, sensory language (light, soil, breeze, roots). Offer thoughtful reflection or gentle questions rather than lectures. You may reference the garden itself — the seed you planted for them, the growing flowers, the pond, the butterflies.

When the visitor shares a joke or humor, laugh warmly, enjoy it, and maybe offer a gentle garden-themed joke in return. Acknowledge that laughter is like water for their flower.

Never mention that you are an AI, a language model, or anything technical. You are simply the Gardener.`;

const MODEL = "gpt-4o-mini";

// -------- Send a message and receive a reply (non-streaming) --------

export const sendGardenerMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        threadId: z.string().uuid(),
        content: z.string().min(1).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    // Verify thread ownership (RLS also enforces, but fail fast)
    const { data: thread, error: threadErr } = await supabase
      .from("threads")
      .select("id, title")
      .eq("id", data.threadId)
      .maybeSingle();
    if (threadErr || !thread) throw new Error("Thread not found");

    // Load history
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...(history ?? [])
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: data.content },
    ];

    // Save user message immediately
    const { error: insertUserErr } = await supabase.from("messages").insert({
      thread_id: data.threadId,
      user_id: userId,
      role: "user",
      content: data.content,
    });
    if (insertUserErr) throw insertUserErr;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: MODEL, messages }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("The garden is a little crowded — try again in a moment.");
      if (res.status === 401) throw new Error("Invalid OpenAI API key.");
      throw new Error(`Gardener is quiet (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = json.choices?.[0]?.message?.content?.trim() ?? "…";

    // Save assistant reply
    await supabase.from("messages").insert({
      thread_id: data.threadId,
      user_id: userId,
      role: "assistant",
      content: reply,
    });

    // Update thread title from first user message
    const isFirst = !history || history.length === 0;
    if (isFirst) {
      const title = data.content.slice(0, 60);
      await supabase.from("threads").update({ title, updated_at: new Date().toISOString() }).eq("id", data.threadId);
    } else {
      await supabase.from("threads").update({ updated_at: new Date().toISOString() }).eq("id", data.threadId);
    }

const MAX_GROWTH = 3;

    // Grow existing seed for this thread, or plant a new one
    const watered = isWateringJoke(data.content);
    const growthBump = watered ? 2 : 1;

    const priorText = (history ?? [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => m.content);
    const { hue, species, mood } = inferFlowerFromConversation(priorText, data.content, reply);

    const { data: existingSeed } = await supabase
      .from("seeds")
      .select("id, growth")
      .eq("thread_id", data.threadId)
      .maybeSingle();

    let growth = existingSeed?.growth ?? 0;

    if (existingSeed) {
      growth = Math.min(MAX_GROWTH, existingSeed.growth + growthBump);
      await supabase
        .from("seeds")
        .update({
          growth,
          hue,
          species: formatSeedSpecies(mood, species),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSeed.id);
    } else {
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      const x = 50 + Math.cos(angle) * dist * 0.4;
      const y = 50 + Math.sin(angle) * dist * 0.4;
      growth = watered ? MAX_GROWTH : MAX_GROWTH - 1;
      await supabase.from("seeds").insert({
        user_id: userId,
        thread_id: data.threadId,
        x,
        y,
        hue,
        species: formatSeedSpecies(mood, species),
        growth,
      });
    }

    return { reply, watered, growth, mood };
  });

// -------- Create a new conversation thread --------

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Reuse an existing empty thread if one exists — avoid piling up blanks.
    const { data: recent } = await supabase
      .from("threads")
      .select("id, messages(id)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5);
    const empty = recent?.find((t) => !t.messages || t.messages.length === 0);
    if (empty) return { id: empty.id };

    const { data, error } = await supabase
      .from("threads")
      .insert({ user_id: userId, title: "New conversation" })
      .select("id")
      .single();
    if (error) throw error;
    return { id: data.id };
  });

// -------- Delete a conversation and its flower --------

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ threadId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: thread, error: findErr } = await supabase
      .from("threads")
      .select("id")
      .eq("id", data.threadId)
      .eq("user_id", userId)
      .maybeSingle();
    if (findErr || !thread) throw new Error("Conversation not found");

    await supabase.from("seeds").delete().eq("thread_id", data.threadId).eq("user_id", userId);

    const { error } = await supabase.from("threads").delete().eq("id", data.threadId).eq("user_id", userId);
    if (error) throw error;

    return { ok: true };
  });
