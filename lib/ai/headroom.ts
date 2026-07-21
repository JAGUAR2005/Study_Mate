import { compress } from "headroom-ai";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * Compresses long reading context before it is sent to the model.
 *
 * The helper deliberately runs only on the server. Configure a Headroom proxy
 * or Cloud key before calling it from the future AI route; until then the UI
 * uses local demo responses and no document text leaves the browser.
 */
export async function compactReadingContext(messages: ChatMessage[]) {
  if (!process.env.HEADROOM_BASE_URL && !process.env.HEADROOM_API_KEY) {
    return { messages, tokensSaved: 0, compressionRatio: 1 };
  }

  try {
    const configuredBudget = Number(process.env.HEADROOM_TOKEN_BUDGET);
    return await compress(messages, {
      model: process.env.OPENAI_MODEL ?? process.env.GEMINI_MODEL ?? "gpt-5.6-luna",
      baseUrl: process.env.HEADROOM_BASE_URL,
      apiKey: process.env.HEADROOM_API_KEY,
      tokenBudget: Number.isFinite(configuredBudget) && configuredBudget > 0 ? configuredBudget : undefined,
      // Keep the study flow resilient if a local proxy is stopped or unavailable.
      fallback: true,
    });
  } catch {
    // Context compression is an optimization, never a reason to drop a study action.
    return { messages, tokensSaved: 0, compressionRatio: 1 };
  }
}
