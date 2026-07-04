export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type CompletionResult = {
  content: string;
  provider: string;
};

type CompletionOpts = {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
};

type ProviderAttempt = {
  name: string;
  complete: (messages: ChatMessage[], opts: CompletionOpts) => Promise<Response>;
};

const BUSY_STATUSES = new Set([429, 503, 502, 529]);

function env(key: string): string | undefined {
  const value = process.env[key];
  return value?.trim() || undefined;
}

export function hasLlmProvider(): boolean {
  return !!(env("OPENAI_API_KEY") || env("GROQ_API_KEY") || env("GEMINI_API_KEY"));
}

function openAiAttempt(apiKey: string, model: string): ProviderAttempt {
  return {
    name: `openai/${model}`,
    complete: (messages, opts) =>
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: opts.temperature ?? 0.7,
          max_tokens: opts.maxTokens,
          ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        }),
      }),
  };
}

function groqAttempt(apiKey: string, model: string): ProviderAttempt {
  return {
    name: `groq/${model}`,
    complete: (messages, opts) =>
      fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: opts.temperature ?? 0.7,
          max_tokens: opts.maxTokens,
          ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        }),
      }),
  };
}

function geminiAttempt(apiKey: string, model: string): ProviderAttempt {
  return {
    name: `gemini/${model}`,
    complete: (messages, opts) => {
      const system = messages.find((m) => m.role === "system")?.content;
      const turns = messages.filter((m) => m.role !== "system");
      const contents = turns.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      return fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
            contents,
            generationConfig: {
              temperature: opts.temperature ?? 0.7,
              maxOutputTokens: opts.maxTokens,
              ...(opts.json ? { responseMimeType: "application/json" } : {}),
            },
          }),
        },
      );
    },
  };
}

function providers(): ProviderAttempt[] {
  const list: ProviderAttempt[] = [];
  const openai = env("OPENAI_API_KEY");
  const groq = env("GROQ_API_KEY");
  const gemini = env("GEMINI_API_KEY");

  if (groq) list.push(groqAttempt(groq, "llama-3.1-8b-instant"));
  if (gemini) list.push(geminiAttempt(gemini, "gemini-2.0-flash"));
  if (openai) list.push(openAiAttempt(openai, "gpt-4o-mini"));

  return list;
}

async function parseJsonResponse(provider: ProviderAttempt, text: string): Promise<string | null> {
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    if (provider.name.startsWith("gemini/")) {
      const candidates = json.candidates as
        | Array<{ content?: { parts?: Array<{ text?: string }> } }>
        | undefined;
      return candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
    }
    const choices = json.choices as Array<{ message?: { content?: string } }> | undefined;
    return choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

function isQuotaError(body: string): boolean {
  return /insufficient_quota|"code"\s*:\s*"insufficient_quota"/i.test(body);
}

export async function chatComplete(
  messages: ChatMessage[],
  opts: CompletionOpts = {},
): Promise<CompletionResult> {
  const chain = providers();
  if (chain.length === 0) {
    throw new Error(
      "No LLM configured. Set OPENAI_API_KEY and/or free fallbacks GROQ_API_KEY, GEMINI_API_KEY.",
    );
  }

  let sawQuota = false;
  let sawBusy = false;
  let lastError = "";

  for (const provider of chain) {
    let res: Response;
    try {
      res = await provider.complete(messages, opts);
    } catch (err) {
      lastError = err instanceof Error ? err.message : "network error";
      continue;
    }

    const text = await res.text();
    if (res.ok) {
      const content = await parseJsonResponse(provider, text);
      if (content) return { content, provider: provider.name };
      lastError = "empty response";
      continue;
    }

    lastError = text.slice(0, 300);
    if (isQuotaError(text)) sawQuota = true;
    if (BUSY_STATUSES.has(res.status)) sawBusy = true;
    if (res.status === 401 || res.status === 403) continue;
  }

  if (chain.length === 1 && sawQuota) {
    throw new Error(
      "OpenAI quota is used up. Add billing at platform.openai.com, or set a free GROQ_API_KEY (console.groq.com) or GEMINI_API_KEY (aistudio.google.com) in .env and Cloudflare runtime vars.",
    );
  }

  if (sawBusy || sawQuota) {
    throw new Error(
      "All LLM providers are unavailable (quota or rate limit). Add a free GROQ_API_KEY or GEMINI_API_KEY fallback, or wait and retry.",
    );
  }

  throw new Error(`Gardener is quiet: ${lastError || "all providers failed"}`);
}

export async function chatCompleteJson(
  system: string,
  user: string,
  opts: Omit<CompletionOpts, "json"> = {},
): Promise<CompletionResult | null> {
  try {
    return await chatComplete(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { ...opts, json: true, temperature: opts.temperature ?? 0.2, maxTokens: opts.maxTokens ?? 80 },
    );
  } catch {
    return null;
  }
}
