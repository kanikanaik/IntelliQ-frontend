import { prisma } from "@/lib/prisma";
import { getServerSession, requireSession } from "@/lib/session";
import { submitAttemptSchema } from "@/lib/validations";
import { ok, err, handleError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// POST /api/attempt/[id]/submit — grade and complete an attempt (authenticated or guest)
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    // Try to get session (optional)
    const session = await getServerSession();
    const userId = session?.user?.id || null;

    console.info("[attempt-submit] request", { attemptId: id, userId });

    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        quiz: { include: { questions: true } },
      },
    });

    if (!attempt) return err("Attempt not found", 404);
    
    // Allow owner or guest (if attempt.userId is null)
    if (attempt.userId && attempt.userId !== userId) {
      return err("Forbidden", 403);
    }
    
    if (attempt.completedAt) return err("Attempt already submitted", 400);

    const { answers, timeTaken } = submitAttemptSchema.parse(await request.json());
    console.info("[attempt-submit] payload validated", {
      attemptId: id,
      answers: answers.length,
      timeTaken,
    });

    // Grade answers
    const questionMap = new Map(attempt.quiz.questions.map((q) => [q.id, q]));
    let score = 0;

    const answerData = answers.map(({ questionId, selected }) => {
      const question = questionMap.get(questionId);
      if (!question) return null;

      const options = question.options as Array<{ id: string; isCorrect: boolean }>;
      const correctIds = new Set(options.filter((o) => o.isCorrect).map((o) => o.id));
      const selectedSet = new Set(selected);

      const isCorrect =
        correctIds.size === selectedSet.size &&
        [...correctIds].every((id) => selectedSet.has(id));

      if (isCorrect) score += question.points;

      return {
        attemptId: id,
        questionId,
        selected,
        isCorrect,
      };
    }).filter(Boolean) as Array<{
      attemptId: string;
      questionId: string;
      selected: string[];
      isCorrect: boolean;
    }>;

    // Persist in transaction
    const [, updated] = await prisma.$transaction([
      prisma.answer.createMany({ data: answerData }),
      prisma.attempt.update({
        where: { id },
        data: { score, timeTaken, completedAt: new Date() },
      }),
    ]);

    console.info("[attempt-submit] success", {
      attemptId: id,
      score: updated.score,
      totalPoints: attempt.totalPoints,
    });

    return ok({
      score: updated.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.totalPoints > 0
        ? Math.round((updated.score / attempt.totalPoints) * 100)
        : 0,
      timeTaken: updated.timeTaken,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}

// GET /api/attempt/[id] — get attempt details (authenticated or guest)
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    // Try to get session (optional)
    const session = await getServerSession();
    const userId = session?.user?.id || null;

    console.info("[attempt-get] request", { attemptId: id, userId });

    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        answers: { include: { question: true } },
        quiz: { select: { id: true, title: true } },
      },
    });

    if (!attempt) return err("Attempt not found", 404);
    
    // Allow owner or guest (if attempt.userId is null)
    if (attempt.userId && attempt.userId !== userId) {
      return err("Forbidden", 403);
    }

    console.info("[attempt-get] success", {
      attemptId: id,
      answerCount: attempt.answers.length,
    });

    return ok(attempt);
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}
