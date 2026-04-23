import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { ok, err, handleError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// GET /api/quiz/[id]/analytics — owner only
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await requireSession();

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) return err("Quiz not found", 404);
    if (quiz.createdBy !== session.user.id) return err("Forbidden", 403);

    const [attempts, avgScore, topAttempts] = await Promise.all([
      prisma.attempt.count({ where: { quizId: id, completedAt: { not: null } } }),
      prisma.attempt.aggregate({
        where: { quizId: id, completedAt: { not: null } },
        _avg: { score: true, timeTaken: true },
      }),
      prisma.attempt.findMany({
        where: { quizId: id, completedAt: { not: null } },
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { score: "desc" },
        take: 10,
      }),
    ]);

    return ok({
      totalAttempts: attempts,
      avgScore: avgScore._avg.score ?? 0,
      avgTimeTaken: avgScore._avg.timeTaken ?? 0,
      topAttempts,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}
