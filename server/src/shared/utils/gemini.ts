import { env } from "../../config/env";

interface GeminiLeadSuggestionInput {
  companyName: string;
  source?: string | null;
  estimatedValue?: string | number | null;
  notes?: string | null;
}

export interface LeadSuggestion {
  summary: string;
  nextBestAction: string;
  priority: "high" | "medium" | "low";
}

export async function generateLeadSuggestion(input: GeminiLeadSuggestionInput): Promise<LeadSuggestion> {
  const fallback = buildFallbackSuggestion(input);

  if (!env.geminiApiKey) {
    return fallback;
  }

  const prompt = [
    "You are an enterprise CRM copilot.",
    "Return strict JSON with keys: summary, nextBestAction, priority.",
    "priority must be one of: high, medium, low.",
    `Company: ${input.companyName}`,
    `Source: ${input.source ?? "unknown"}`,
    `Estimated value: ${input.estimatedValue ?? "unknown"}`,
    `Notes: ${input.notes ?? "none"}`,
  ].join("\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      return fallback;
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return fallback;
    }

    const parsed = JSON.parse(text) as Partial<LeadSuggestion>;
    if (!parsed.summary || !parsed.nextBestAction || !parsed.priority) {
      return fallback;
    }

    if (!["high", "medium", "low"].includes(parsed.priority)) {
      return fallback;
    }

    return parsed as LeadSuggestion;
  } catch {
    return fallback;
  }
}

function buildFallbackSuggestion(input: GeminiLeadSuggestionInput): LeadSuggestion {
  const estimated = Number(input.estimatedValue ?? 0);
  const priority: LeadSuggestion["priority"] = estimated >= 10000 ? "high" : estimated >= 3000 ? "medium" : "low";

  return {
    summary: `Lead from ${input.companyName} is currently in qualification stage and needs discovery context.`,
    nextBestAction: "Schedule a discovery call, capture budget/timeline, and send a tailored capability deck.",
    priority,
  };
}
