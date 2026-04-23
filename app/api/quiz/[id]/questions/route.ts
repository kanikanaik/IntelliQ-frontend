import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saveQuestionsSchema } from "@/lib/validations";
import { ok, err, handleError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// GET /api/quiz/[id]/questions
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await requireSession();
    console.info("[quiz-questions] get", { quizId: id, userId: session.user.id });

    const quiz = await prisma.quiz.findUnique({ where: { id } });

    if (!quiz) return err("Quiz not found", 404);
    if (!quiz.isPublished && quiz.createdBy !== session.user.id) {
      return err("Forbidden", 403);
    }

    const questions = await prisma.question.findMany({
      where: { quizId: id },
      orderBy: { order: "asc" },
    });

    console.info("[quiz-questions] get success", {
      quizId: id,
      count: questions.length,
    });

    return ok(questions);
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}

// POST /api/quiz/[id]/questions — replace all questions (owner only)
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await requireSession();
    console.info("[quiz-questions] save", { quizId: id, userId: session.user.id });

    const quiz = await prisma.quiz.findUnique({ where: { id } });

    if (!quiz) return err("Quiz not found", 404);
    if (quiz.createdBy !== session.user.id) return err("Forbidden", 403);

    const { questions } = saveQuestionsSchema.parse(await request.json());
    console.info("[quiz-questions] validated payload", {
      quizId: id,
      count: questions.length,
    });

    // Replace all questions in a transaction
    const result = await prisma.$transaction([
      prisma.question.deleteMany({ where: { quizId: id } }),
      prisma.question.createMany({
        data: questions.map((q, i) => ({
          quizId: id,
          text: q.text,
          type: q.type,
          options: q.options,
          explanation: q.explanation,
          points: q.points,
          order: q.order ?? i,
        })),
      }),
    ]);

    console.info("[quiz-questions] save success", {
      quizId: id,
      deleted: result[0].count,
      created: result[1].count,
    });

    return ok({ deleted: result[0].count, created: result[1].count });
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}
