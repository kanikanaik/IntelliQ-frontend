import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { ok, err, handleError } from "@/lib/api";
import { nanoid } from "nanoid";

type Params = { params: Promise<{ id: string }> };

// POST /api/quiz/[id]/publish — toggle published status (owner only)
export async function POST(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await requireSession();
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { _count: { select: { questions: true } } },
    });

    if (!quiz) return err("Quiz not found", 404);
    if (quiz.createdBy !== session.user.id) return err("Forbidden", 403);
    if (quiz._count.questions === 0) {
      return err("Cannot publish a quiz with no questions", 400);
    }

    const shouldPublish = !quiz.isPublished;
    const shareId = quiz.shareId ?? nanoid(10);

    console.info("[quiz-publish] toggle", {
      quizId: id,
      userId: session.user.id,
      from: quiz.isPublished ? "PUBLISHED" : "DRAFT",
      to: shouldPublish ? "PUBLISHED" : "DRAFT",
      questionCount: quiz._count.questions,
      shareId,
    });

    const updated = await prisma.quiz.update({
      where: { id },
      data: {
        isPublished: shouldPublish,
        status: shouldPublish ? "PUBLISHED" : "DRAFT",
        // Keep shareId stable even when unpublishing so old links work again when republished.
        shareId,
      },
    });

    const shareUrl = updated.isPublished
      ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/quiz/${updated.shareId}`
      : null;

    console.info("[quiz-publish] result", {
      quizId: id,
      isPublished: updated.isPublished,
      shareUrl,
    });

    return ok({ ...updated, shareUrl });
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}
