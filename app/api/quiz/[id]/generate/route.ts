import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { generateQuestionsSchema } from "@/lib/validations";
import { ok, err, handleError } from "@/lib/api";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ id: string }> };

type RawGeneratedQuestion = {
  text?: unknown;
  question?: unknown;
  type?: unknown;
  options?: unknown;
  correctAnswer?: unknown;
  correctAnswers?: unknown;
  explanation?: unknown;
};

type RequestedQuestionType = "MCQ" | "MULTI_SELECT" | "MIXED";
type NormalizedQuestionType = "MCQ" | "MULTI_SELECT";
type NormalizedOption = {
  text: string;
  hintedCorrect: boolean;
};

// POST /api/quiz/[id]/generate — AI question generation via Gemini
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await requireSession();

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: { id: true, createdBy: true },
    });
    if (!quiz) return err("Quiz not found", 404);
    if (quiz.createdBy !== session.user.id) return err("Forbidden", 403);

    const { topic, description, notes, sourceUrl, count, type, context } =
      generateQuestionsSchema.parse(await request.json());

    const geminiApiKey =
      process.env.GEMINI_API_KEY ??
      process.env.GOOGLE_API_KEY ??
      process.env.GCP_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const openRouterModel =
      process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-001";

    console.info("[quiz-generate] request", {
      quizId: id,
      userId: session.user.id,
      topic,
      hasDescription: Boolean(description?.trim()),
      count,
      type,
      hasNotes: Boolean((notes ?? context)?.trim()),
      hasSourceUrl: Boolean(sourceUrl?.trim()),
      geminiModel,
      openRouterModel,
    });

    if (
      (!geminiApiKey || geminiApiKey === "your_gemini_api_key_here") &&
      !openRouterApiKey
    ) {
      return err(
        "AI provider is not configured. Set GEMINI_API_KEY (or GCP_API_KEY) or OPENROUTER_API_KEY.",
        500
      );
    }

    let resolvedNotes = (notes ?? context ?? "").trim();
    let resolvedUrl = (sourceUrl ?? "").trim();

    if (!resolvedUrl && looksLikeUrl(resolvedNotes)) {
      resolvedUrl = resolvedNotes;
      resolvedNotes = "";
    }

    let extractedUrlText = "";
    if (resolvedUrl) {
      console.info("[quiz-generate] context is URL, fetching page content", {
        url: resolvedUrl,
      });
      extractedUrlText = await fetchUrlText(resolvedUrl);
    }

    const resolvedContext = buildSourceContext({
      description: (description ?? "").trim(),
      notes: resolvedNotes,
      sourceUrl: resolvedUrl,
      extractedUrlText,
    });

    const prompt = buildPrompt({
      topic,
      count,
      type,
      context: resolvedContext,
    });

    let content = "";

    if (geminiApiKey && geminiApiKey !== "your_gemini_api_key_here") {
      try {
        content = await generateWithGemini({
          apiKey: geminiApiKey,
          model: geminiModel,
          prompt,
        });
      } catch (geminiError) {
        console.error("[quiz-generate] Gemini generation failed", geminiError);
        if (!openRouterApiKey) {
          return err(
            "AI generation failed with Gemini. Check your Gemini key/model configuration.",
            502
          );
        }

        content = await generateWithOpenRouter({
          apiKey: openRouterApiKey,
          model: openRouterModel,
          prompt,
        });
      }
    } else if (openRouterApiKey) {
      content = await generateWithOpenRouter({
        apiKey: openRouterApiKey,
        model: openRouterModel,
        prompt,
      });
    }

    console.info("[quiz-generate] raw response received", {
      textLength: content.length,
    });

    let parsed: unknown;
    try {
      parsed = parseAiJson(content);
    } catch (parseError) {
      console.error("[quiz-generate] AI JSON parse failed", {
        error: parseError,
        raw: content.slice(0, 2000),
      });
      return err(
        "AI returned malformed JSON. Try again with more focused source content.",
        502
      );
    }

    const rawQuestions = extractRawQuestions(parsed);

    if (rawQuestions.length === 0) {
      return err(
        "AI returned no questions. Try adding richer notes/content and generate again.",
        502
      );
    }

    const questions = rawQuestions.slice(0, count).map((q, i) =>
      toQuestionDraft(q, i, type)
    );

    console.info("[quiz-generate] returning questions", {
      generated: questions.length,
      requested: count,
    });

    return ok({ questions });
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}

function buildPrompt({
  topic,
  count,
  type,
  context,
}: {
  topic: string;
  count: number;
  type: RequestedQuestionType;
  context: string;
}) {
  const typeGuide =
    type === "MIXED"
      ? "Use a balanced mix of MCQ and MULTI_SELECT questions."
      : type === "MULTI_SELECT"
      ? "Use only MULTI_SELECT questions."
      : "Use only MCQ questions.";

  return `You are an expert assessment author.
Create exactly ${count} high-quality quiz questions on the topic: "${topic}".

${typeGuide}

Requirements:
- Questions must be clear, factual, and logically consistent.
- Avoid duplicates and vague wording.
- Each question must have exactly 4 options.
- For MCQ: exactly 1 correct option.
- For MULTI_SELECT: 2 to 3 correct options.
- Keep explanations concise (1 sentence).
- If source content is provided, prioritize it and avoid hallucinating facts not present in it.
- Keep option text short and distinct.

${context ? `Source content:\n${context}\n` : ""}

Return ONLY strict JSON (no markdown, no comments) with this exact shape:
{
  "questions": [
    {
      "text": "Question text",
      "type": "MCQ",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswers": ["A"],
      "explanation": "Short explanation"
    }
  ]
}`;
}

function buildSourceContext({
  description,
  notes,
  sourceUrl,
  extractedUrlText,
}: {
  description: string;
  notes: string;
  sourceUrl: string;
  extractedUrlText: string;
}) {
  const blocks: string[] = [];

  if (description) {
    blocks.push(`Quiz description:\n${description.slice(0, 1000)}`);
  }

  if (notes) {
    blocks.push(`Notes / source text:\n${notes.slice(0, 10000)}`);
  }

  if (sourceUrl) {
    blocks.push(`Source URL:\n${sourceUrl}`);
  }

  if (extractedUrlText) {
    blocks.push(`Extracted page text:\n${extractedUrlText.slice(0, 8000)}`);
  }

  return blocks.join("\n\n");
}

function looksLikeUrl(value: string) {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

async function generateWithGemini({
  apiKey,
  model,
  prompt,
}: {
  apiKey: string;
  model: string;
  prompt: string;
}) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini HTTP ${response.status}: ${errorText.slice(0, 400)}`);
  }

  const aiJson = (await response.json()) as unknown;
  const content = extractGeminiText(aiJson);
  if (!content.trim()) {
    throw new Error("Gemini returned an empty response");
  }

  return content;
}

async function generateWithOpenRouter({
  apiKey,
  model,
  prompt,
}: {
  apiKey: string;
  model: string;
  prompt: string;
}) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You output only valid JSON and never include markdown fences.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenRouter HTTP ${response.status}: ${errorText.slice(0, 400)}`
    );
  }

  const aiJson = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };

  const content = extractOpenRouterText(aiJson);
  if (!content.trim()) {
    throw new Error("OpenRouter returned an empty response");
  }

  return content;
}

async function fetchUrlText(url: string) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "IntelliQQuizBot/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("[quiz-generate] failed to fetch source URL", {
        url,
        status: response.status,
      });
      return "";
    }

    const html = await response.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.slice(0, 8000);
  } catch (error) {
    console.warn("[quiz-generate] source URL extraction error", {
      url,
      error,
    });
    return "";
  }
}

function extractOpenRouterText(aiJson: {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
}) {
  const first = aiJson.choices?.[0]?.message?.content;
  if (typeof first === "string") return first;
  if (Array.isArray(first)) {
    return first
      .map((part) => (part.type === "text" ? part.text ?? "" : ""))
      .join("\n");
  }
  return "";
}

function extractGeminiText(aiJson: unknown) {
  const payload = aiJson as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  return (
    payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("\n") ?? ""
  );
}

function parseAiJson(content: string) {
  const cleaned = stripMarkdownFences(content);
  const candidates: string[] = [cleaned];

  const arrayStart = cleaned.indexOf("[");
  const arrayEnd = cleaned.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    candidates.push(cleaned.slice(arrayStart, arrayEnd + 1));
  }

  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd > objectStart) {
    candidates.push(cleaned.slice(objectStart, objectEnd + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }

  throw new Error("AI returned malformed JSON");
}

function stripMarkdownFences(value: string) {
  return value
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();
}

function extractRawQuestions(parsed: unknown): RawGeneratedQuestion[] {
  if (Array.isArray(parsed)) return parsed as RawGeneratedQuestion[];
  if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { questions?: unknown }).questions)
  ) {
    return (parsed as { questions: RawGeneratedQuestion[] }).questions;
  }
  return [];
}

function toQuestionDraft(
  raw: RawGeneratedQuestion,
  index: number,
  requestedType: RequestedQuestionType
) {
  const qType = inferQuestionType(raw.type, requestedType, index);
  const normalizedOptions = normalizeRawOptions(raw.options);
  const optionTexts = normalizedOptions.map((option) => option.text).slice(0, 4);

  while (optionTexts.length < 4) {
    optionTexts.push(`Option ${String.fromCharCode(65 + optionTexts.length)}`);
  }

  const hintedCorrectIndexes = normalizedOptions
    .map((option, optionIdx) => (option.hintedCorrect ? optionIdx : -1))
    .filter((optionIdx) => optionIdx >= 0);

  const correctIndexes = resolveCorrectIndexes({
    correctAnswers: raw.correctAnswers,
    correctAnswer: raw.correctAnswer,
    optionTexts,
    hintedCorrectIndexes,
  });

  const normalizedCorrectIndexes = [...correctIndexes].filter(
    (optionIdx) => optionIdx >= 0 && optionIdx < optionTexts.length
  );

  const resolvedCorrect = new Set<number>(normalizedCorrectIndexes);

  if (qType === "MCQ") {
    const first = normalizedCorrectIndexes[0] ?? 0;
    resolvedCorrect.clear();
    resolvedCorrect.add(first);
  } else {
    if (resolvedCorrect.size === 0) {
      resolvedCorrect.add(0);
      resolvedCorrect.add(1);
    } else if (resolvedCorrect.size === 1) {
      const first = [...resolvedCorrect][0] ?? 0;
      resolvedCorrect.add(first === 0 ? 1 : 0);
    } else if (resolvedCorrect.size > 3) {
      const keep = [...resolvedCorrect].slice(0, 3);
      resolvedCorrect.clear();
      for (const item of keep) resolvedCorrect.add(item);
    }
  }

  const rawText =
    typeof raw.text === "string"
      ? raw.text.trim()
      : typeof raw.question === "string"
        ? raw.question.trim()
        : "";

  return {
    text: rawText.length > 0 ? rawText : `Question ${index + 1}`,
    type: qType,
    options: optionTexts.map((text, optionIdx) => ({
      id: randomUUID(),
      text,
      isCorrect: resolvedCorrect.has(optionIdx),
    })),
    explanation:
      typeof raw.explanation === "string" ? raw.explanation.trim() : "",
    points: 1,
    order: index,
  };
}

function inferQuestionType(
  rawType: unknown,
  requestedType: RequestedQuestionType,
  index: number
): NormalizedQuestionType {
  if (requestedType === "MCQ") return "MCQ";
  if (requestedType === "MULTI_SELECT") return "MULTI_SELECT";

  const normalizedRawType =
    typeof rawType === "string"
      ? rawType.trim().toUpperCase().replace(/[\s-]+/g, "_")
      : "";

  if (normalizedRawType === "MULTI_SELECT" || normalizedRawType === "MULTISELECT") {
    return "MULTI_SELECT";
  }

  if (normalizedRawType === "MCQ") {
    return "MCQ";
  }

  return index % 2 === 0 ? "MCQ" : "MULTI_SELECT";
}

function normalizeRawOptions(rawOptions: unknown): NormalizedOption[] {
  if (!Array.isArray(rawOptions)) return [];

  const normalized: NormalizedOption[] = [];
  for (const item of rawOptions) {
    if (typeof item === "string") {
      const text = item.trim();
      if (text) normalized.push({ text, hintedCorrect: false });
      continue;
    }

    if (item && typeof item === "object") {
      const option = item as {
        text?: unknown;
        label?: unknown;
        value?: unknown;
        isCorrect?: unknown;
        correct?: unknown;
      };

      const text = pickOptionText(option);
      if (!text) continue;

      normalized.push({
        text,
        hintedCorrect: option.isCorrect === true || option.correct === true,
      });
    }
  }

  return normalized;
}

function pickOptionText(option: {
  text?: unknown;
  label?: unknown;
  value?: unknown;
}) {
  const candidates = [option.text, option.label, option.value];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return "";
}

function resolveCorrectIndexes({
  correctAnswers,
  correctAnswer,
  optionTexts,
  hintedCorrectIndexes,
}: {
  correctAnswers: unknown;
  correctAnswer: unknown;
  optionTexts: string[];
  hintedCorrectIndexes: number[];
}) {
  const resolved = new Set<number>(hintedCorrectIndexes);

  const values: unknown[] = [];
  if (Array.isArray(correctAnswers)) {
    values.push(...correctAnswers);
  } else if (correctAnswers !== undefined) {
    values.push(correctAnswers);
  }

  if (Array.isArray(correctAnswer)) {
    values.push(...correctAnswer);
  } else if (correctAnswer !== undefined) {
    values.push(correctAnswer);
  }

  for (const value of values) {
    for (const index of normalizeCorrectValueToIndexes(value, optionTexts)) {
      resolved.add(index);
    }
  }

  return resolved;
}

function normalizeCorrectValueToIndexes(
  value: unknown,
  optionTexts: string[]
): number[] {
  if (typeof value === "number" && Number.isFinite(value)) {
    const num = Math.trunc(value);
    if (num >= 0 && num < optionTexts.length) return [num];
    if (num >= 1 && num <= optionTexts.length) return [num - 1];
    return [];
  }

  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  const upper = trimmed.toUpperCase();

  if (/^[A-Z]$/.test(upper)) {
    const idx = upper.charCodeAt(0) - 65;
    return idx >= 0 && idx < optionTexts.length ? [idx] : [];
  }

  if (/^\d+$/.test(upper)) {
    const num = Number.parseInt(upper, 10);
    if (num >= 0 && num < optionTexts.length) return [num];
    if (num >= 1 && num <= optionTexts.length) return [num - 1];
    return [];
  }

  const split = upper.split(/[\s,|/]+/).filter(Boolean);
  if (split.length > 1) {
    return split.flatMap((part) => normalizeCorrectValueToIndexes(part, optionTexts));
  }

  const byText = optionTexts.findIndex(
    (optionText) => optionText.trim().toLowerCase() === trimmed.toLowerCase()
  );
  return byText >= 0 ? [byText] : [];
}
