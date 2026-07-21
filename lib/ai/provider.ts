export type AiProvider = "openai" | "gemini";

export function activeProvider(): AiProvider {
  const requested = process.env.AI_PROVIDER?.toLowerCase();
  if (requested === "gemini" || requested === "openai") return requested;
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "gemini";
}

export function modelFor(provider = activeProvider()) {
  return provider === "gemini"
    ? process.env.GEMINI_MODEL ?? "gemini-2.5-flash"
    : process.env.OPENAI_MODEL ?? "gpt-5.6-luna";
}

export function providerKey(provider = activeProvider()) {
  const key = provider === "gemini" ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY;
  if (!key) {
    const variable = provider === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY";
    throw new Error(`${variable} is not configured. Add a server-side key to .env.local, then restart the app.`);
  }
  return key;
}

export async function generateGeminiJson({ prompt, schema }: { prompt: string; schema: Record<string, unknown> }) {
  const key = providerKey("gemini");
  const model = modelFor("gemini");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", responseJsonSchema: schema },
      }),
    });
    const data = await response.json() as { error?: { message?: string }; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    if (response.ok) {
      const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
      if (!text) throw new Error("Gemini did not return a study result. Please try again.");
      return text;
    }
    const temporary = response.status === 429 || response.status === 500 || response.status === 502 || response.status === 503;
    if (!temporary || attempt === 2) throw new Error(data.error?.message ?? "Gemini could not complete this study action.");
    await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
  }
  throw new Error("Gemini could not complete this study action.");
}

export async function embedWithActiveProvider(texts: string[], kind: "document" | "query") {
  const provider = activeProvider();
  if (provider === "openai") {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: providerKey("openai") });
    const response = await client.embeddings.create({ model: process.env.RAG_EMBEDDING_MODEL ?? "text-embedding-3-small", input: texts, encoding_format: "float" });
    return response.data.map((item) => item.embedding);
  }

  const key = providerKey("gemini");
  const model = process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-2";
  const documents = texts.map((text) => kind === "query" ? `task: search result | query: ${text}` : `title: StudyMate PDF | text: ${text}`);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: documents.map((text) => ({
        model: `models/${model}`,
        content: { parts: [{ text }] },
        outputDimensionality: 1536,
      })),
    }),
  });
  const data = await response.json() as { error?: { message?: string }; embeddings?: Array<{ values?: number[] }> };
  if (!response.ok) throw new Error(data.error?.message ?? "Gemini could not create the PDF retrieval index.");
  const embeddings = data.embeddings?.map((embedding) => embedding.values ?? []);
  if (!embeddings?.length || embeddings.some((embedding) => embedding.length !== 1536)) throw new Error("Gemini returned an invalid embedding response.");
  return embeddings;
}
