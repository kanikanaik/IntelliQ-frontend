import { z } from "zod";

// ─── Quiz ───────────────────────────────────────────────────────────────────

export const createQuizSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  topic: z.string().max(80).optional(),
  timeLimit: z.number().int().positive().optional(), // seconds
});

export const updateQuizSchema = createQuizSchema.partial();

// ─── Question ───────────────────────────────────────────────────────────────

const optionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  text: z.string().min(1).max(1000),
  type: z.enum(["MCQ", "MULTI_SELECT"]).default("MCQ"),
  options: z
    .array(optionSchema)
    .min(2)
    .max(6)
    .refine((opts) => opts.some((o) => o.isCorrect), {
      message: "At least one option must be correct",
    }),
  explanation: z.string().max(500).optional(),
  points: z.number().int().min(1).max(10).default(1),
  order: z.number().int().min(0).default(0),
});

export const saveQuestionsSchema = z.object({
  questions: z.array(questionSchema).min(1).max(50),
});

// ─── Generate (AI) ──────────────────────────────────────────────────────────

export const generateQuestionsSchema = z.object({
  topic: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  notes: z.string().max(12000).optional(),
  sourceUrl: z.string().url().max(2000).optional(),
  count: z.number().int().min(1).max(20).default(5),
  type: z.enum(["MCQ", "MULTI_SELECT", "MIXED"]).default("MCQ"),
  context: z.string().max(12000).optional(), // legacy fallback: pasted text / file content
});

// ─── Attempt / Submit ───────────────────────────────────────────────────────

export const submitAttemptSchema = z.object({
  timeTaken: z.number().int().min(0).optional(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selected: z.array(z.string()).min(1),
    })
  ),
});

// ─── Comment ────────────────────────────────────────────────────────────────

export const publishQuizSchema = z.object({
  publish: z.boolean().default(true),
});

export const commentSchema = z.object({
  text: z.string().min(1).max(500),
  attemptId: z.string().uuid(),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type SaveQuestionsInput = z.infer<typeof saveQuestionsSchema>;
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
