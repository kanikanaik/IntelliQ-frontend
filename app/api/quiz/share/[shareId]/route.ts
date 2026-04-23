import { prisma } from "@/lib/prisma";
import { ok, err, handleError } from "@/lib/api";

type Params = { params: Promise<{ shareId: string }> };

// GET /api/quiz/share/[shareId] — PUBLIC endpoint to fetch quiz by shareId
export async function GET(_req: Request, { params }: Params) {
  try {
    const { shareId } = await params;

    console.info("[quiz-share] fetch", { shareId });

    const quiz = await prisma.quiz.findUnique({
      where: { shareId },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        questions: { orderBy: { order: "asc" } },
        _count: { select: { attempts: true, comments: true } },
      },
    });

    if (!quiz) return err("Quiz not found", 404);
    if (!quiz.isPublished) return err("Quiz is not published", 403);

    console.info("[quiz-share] success", {
      shareId,
      quizId: quiz.id,
      questionCount: quiz.questions.length,
    });

    return ok(quiz);
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}
