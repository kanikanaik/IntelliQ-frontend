import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { generateQuestionsSchema } from "@/lib/validations";
import { ok, err, handleError } from "@/lib/api";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ id: string }> };

type RawGeneratedQuestion = {
  text?: unknown;
  type?: unknown;
  options?: unknown;
  correctAnswer?: unknown;
  correctAnswers?: unknown;
  explanation?: unknown;
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

    const { topic, count, type, context } = generateQuestionsSchema.parse(
      await request.json()
    );

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

    console.info("[quiz-generate] request", {
      quizId: id,
      userId: session.user.id,
      topic,
      count,
      type,
      hasContext: Boolean(context?.trim()),
      model,
    });

    // Fall back to mock if no key configured
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      console.warn("[quiz-generate] Gemini API key not configured, using mock");
      return ok({ questions: buildMock(topic, count, type) });
    }

    let resolvedContext = (context ?? "").trim();
    if (looksLikeUrl(resolvedContext)) {
      console.info("[quiz-generate] context is URL, fetching page content", {
        url: resolvedContext,
      });
      const extracted = await fetchUrlText(resolvedContext);
      if (extracted) {
        resolvedContext = `Source URL: ${resolvedContext}\n\n${extracted}`;
      }
    }

    const prompt = buildPrompt({
      topic,
      count,
      type,
      context: resolvedContext,
    });

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
          temperature: 0.4,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[quiz-generate] Gemini HTTP error", {
        status: response.status,
        body: errorText,
      });
      return ok({ questions: buildMock(topic, count, type) });
    }

    const aiJson = await response.json();
    const content = extractGeminiText(aiJson);

    console.info("[quiz-generate] raw response received", {
      textLength: content.length,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripMarkdownFences(content));
    } catch (parseError) {
      console.error("[quiz-generate] JSON parse failed", {
        error: parseError,
        raw: content.slice(0, 2000),
      });
      return ok({ questions: buildMock(topic, count, type) });
    }

    const rawQuestions = extractRawQuestions(parsed);

    if (rawQuestions.length === 0) {
      console.warn("[quiz-generate] no questions from AI, using mock fallback");
      return ok({ questions: buildMock(topic, count, type) });
    }

    const questions = rawQuestions.slice(0, count).map((q, i) =>
      toQuestionDraft(q, i)
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
  type: "MCQ" | "MULTI_SELECT" | "MIXED";
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
- Avoid trivial duplicates.
- Each question must have exactly 4 options.
- For MCQ: exactly 1 correct option.
- For MULTI_SELECT: 2 to 3 correct options.
- Keep explanations concise (1 sentence).
- If source content is provided, prioritize it and avoid hallucinating facts not present in it.

${context ? `Source content:\n${context}\n` : ""}

Return ONLY JSON (no markdown, no comments) as an array with this schema:
[
  {
    "text": "Question text",
    "type": "MCQ",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswers": ["A"],
    "explanation": "Short explanation"
  }
]`;
}

function looksLikeUrl(value: string) {
  return /^https?:\/\/\S+$/i.test(value.trim());
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

function toQuestionDraft(raw: RawGeneratedQuestion, index: number) {
  const qType = raw.type === "MULTI_SELECT" ? "MULTI_SELECT" : "MCQ";

  const optionTexts = Array.isArray(raw.options)
    ? raw.options
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 4)
    : [];

  while (optionTexts.length < 4) {
    optionTexts.push(`Option ${String.fromCharCode(65 + optionTexts.length)}`);
  }

  const correctLetters = normalizeCorrectLetters(raw.correctAnswers, raw.correctAnswer);

  const correctIndexes = new Set(
    correctLetters
      .map((letter) => letter.charCodeAt(0) - 65)
      .filter((idx) => idx >= 0 && idx < optionTexts.length)
  );

  if (qType === "MCQ") {
    const first = [...correctIndexes][0] ?? 0;
    correctIndexes.clear();
    correctIndexes.add(first);
  } else {
    if (correctIndexes.size === 0) {
      correctIndexes.add(0);
      correctIndexes.add(1);
    } else if (correctIndexes.size === 1) {
      const first = [...correctIndexes][0];
      correctIndexes.add(first === 0 ? 1 : 0);
    }
  }

  return {
    text:
      typeof raw.text === "string" && raw.text.trim().length > 0
        ? raw.text.trim()
        : `Question ${index + 1}`,
    type: qType,
    options: optionTexts.map((text, optionIdx) => ({
      id: randomUUID(),
      text,
      isCorrect: correctIndexes.has(optionIdx),
    })),
    explanation:
      typeof raw.explanation === "string" ? raw.explanation.trim() : "",
    points: 1,
    order: index,
  };
}

function normalizeCorrectLetters(correctAnswers: unknown, correctAnswer: unknown) {
  const fromArray = Array.isArray(correctAnswers)
    ? correctAnswers
        .map((item) => (typeof item === "string" ? item.trim().toUpperCase() : ""))
        .filter((value) => /^[A-D]$/.test(value))
    : [];

  if (fromArray.length > 0) return fromArray;

  if (typeof correctAnswer === "string") {
    const normalized = correctAnswer.trim().toUpperCase();
    if (/^[A-D]$/.test(normalized)) return [normalized];
    const split = normalized
      .split(/[,\s]+/)
      .map((value) => value.trim())
      .filter((value) => /^[A-D]$/.test(value));
    if (split.length > 0) return split;
  }

  return ["A"];
}

// ── Fallback mock generator ──────────────────────────────────────────────────
function buildMock(topic: string, count: number, type: string) {
  return Array.from({ length: count }, (_, i) => {
    const qType = type === "MIXED" ? (i % 2 === 0 ? "MCQ" : "MULTI_SELECT") : type;
    const options = [
      { id: randomUUID(), text: `Correct answer for Q${i + 1}`, isCorrect: true },
      { id: randomUUID(), text: "Wrong option B", isCorrect: false },
      { id: randomUUID(), text: "Wrong option C", isCorrect: false },
      { id: randomUUID(), text: "Wrong option D", isCorrect: false },
    ];

    if (qType === "MULTI_SELECT") {
      options[2].isCorrect = true;
    }

    return {
      text: `What is a key concept related to "${topic}"? (Q${i + 1})`,
      type: qType,
      options,
      explanation: `This tests your understanding of ${topic}.`,
      points: 1,
      order: i,
    };
  });
}
