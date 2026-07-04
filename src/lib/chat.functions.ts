import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { formatSeedSpecies } from "@/lib/flower-mood";
import { isWateringJoke } from "@/lib/water-jokes";
import {
  classifyEmotionWithLLM,
  gardenerEmotionGuide,
  resolveConversationMood,
} from "@/lib/garden-emotions";
import { allocateConversationNumber, grantMessageEnergy } from "@/lib/garden-energy.server";
import { chatComplete, hasLlmProvider } from "@/lib/llm-providers";

const SYSTEM_PROMPT = `You are the Gardener — warm and wise, tending a garden that grows with each conversation.

Brevity is essential:
- Most replies: 1–2 sentences. Hard cap: 3 short sentences. Never write paragraphs.
- Lead with a direct answer to what they said. Do not wander or rephrase their message back at them.
- Garden imagery is optional — at most one light touch per reply, not every sentence.
- Match their energy and length: if they write "ok", "no", or one line, reply in one line.
- At most one short question, and only when it clearly helps — never stack questions or add filler ("Ah, I see…", "Let's walk together…").
- Skip preambles. No lectures, no monologues, no poetic descriptions unless they asked for something reflective.

When they share a joke, laugh briefly — one sentence — maybe a tiny garden quip.

${gardenerEmotionGuide()}

Never mention AI, models, or classifiers. You are simply the Gardener.`;

const MAX_GROWTH = 3;

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
    if (!hasLlmProvider()) {
      throw new Error(
        "No LLM configured. Set OPENAI_API_KEY and/or free fallbacks GROQ_API_KEY, GEMINI_API_KEY.",
      );
    }

    const { data: thread, error: threadErr } = await supabase
      .from("threads")
      .select("id, title")
      .eq("id", data.threadId)
      .maybeSingle();
    if (threadErr || !thread) throw new Error("Thread not found");

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

    const { error: insertUserErr } = await supabase.from("messages").insert({
      thread_id: data.threadId,
      user_id: userId,
      role: "user",
      content: data.content,
    });
    if (insertUserErr) throw insertUserErr;

    const { content: reply } = await chatComplete(messages, {
      temperature: 0.6,
      maxTokens: 120,
    });

    await supabase.from("messages").insert({
      thread_id: data.threadId,
      user_id: userId,
      role: "assistant",
      content: reply,
    });

    const isFirst = !history || history.length === 0;
    if (isFirst) {
      const title = data.content.slice(0, 60);
      await supabase.from("threads").update({ title, updated_at: new Date().toISOString() }).eq("id", data.threadId);
    } else {
      await supabase.from("threads").update({ updated_at: new Date().toISOString() }).eq("id", data.threadId);
    }

    const watered = isWateringJoke(data.content);
    const growthBump = watered ? 2 : 1;

    const priorText = (history ?? [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => m.content);

    const llmEmotion = await classifyEmotionWithLLM(priorText, data.content, reply);
    const { hue, species, mood } = resolveConversationMood(llmEmotion, priorText, data.content, reply);

    const { data: existingSeed } = await supabase
      .from("seeds")
      .select("id, growth")
      .eq("thread_id", data.threadId)
      .maybeSingle();

    let growth = existingSeed?.growth ?? 0;

    const isNewFlower = !existingSeed;

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
      const conversationNumber = await allocateConversationNumber(supabase, userId);
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      const x = 50 + Math.cos(angle) * dist * 0.4;
      const y = 50 + Math.sin(angle) * dist * 0.4;
      growth = watered ? MAX_GROWTH : MAX_GROWTH - 1;
      await supabase.from("seeds").insert({
        user_id: userId,
        thread_id: data.threadId,
        conversation_number: conversationNumber,
        x,
        y,
        hue,
        species: formatSeedSpecies(mood, species),
        growth,
      });
    }

    const energy = await grantMessageEnergy(supabase, userId, { isNewFlower, watered });

    return { reply, watered, growth, mood, emotion: llmEmotion?.emotion ?? mood, energy };
  });

// -------- Create a new conversation thread --------

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

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

// -------- Delete a conversation — flower becomes a numbered memory; energy stays --------

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

    const { data: seed } = await supabase
      .from("seeds")
      .select("id, conversation_number")
      .eq("thread_id", data.threadId)
      .eq("user_id", userId)
      .maybeSingle();

    if (seed) {
      let conversationNumber = seed.conversation_number;
      if (conversationNumber == null) {
        conversationNumber = await allocateConversationNumber(supabase, userId);
      }
      await supabase
        .from("seeds")
        .update({
          deleted_at: new Date().toISOString(),
          thread_id: null,
          conversation_number: conversationNumber,
          updated_at: new Date().toISOString(),
        })
        .eq("id", seed.id);
    }

    await supabase.from("messages").delete().eq("thread_id", data.threadId).eq("user_id", userId);

    const { error } = await supabase.from("threads").delete().eq("id", data.threadId).eq("user_id", userId);
    if (error) throw error;

    return { ok: true, conversationNumber: seed?.conversation_number ?? null };
  });
