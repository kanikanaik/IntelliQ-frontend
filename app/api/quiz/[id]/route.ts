import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { updateQuizSchema } from "@/lib/validations";
import { ok, err, handleError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// GET /api/quiz/[id]
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        questions: { orderBy: { order: "asc" } },
        _count: { select: { attempts: true, comments: true } },
      },
    });
    if (!quiz) return err("Quiz not found", 404);

    // Unpublished quizzes are only visible to the creator
    if (!quiz.isPublished) {
      const session = await requireSession();
      if (quiz.createdBy !== session.user.id) return err("Forbidden", 403);
    }

    return ok(quiz);
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}

// PATCH /api/quiz/[id]
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await requireSession();
    const quiz = await prisma.quiz.findUnique({ where: { id } });

    if (!quiz) return err("Quiz not found", 404);
    if (quiz.createdBy !== session.user.id) return err("Forbidden", 403);

    const body = updateQuizSchema.parse(await request.json());
    const updated = await prisma.quiz.update({ where: { id }, data: body });

    return ok(updated);
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}

// DELETE /api/quiz/[id]
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await requireSession();
    const quiz = await prisma.quiz.findUnique({ where: { id } });

    if (!quiz) return err("Quiz not found", 404);
    if (quiz.createdBy !== session.user.id) return err("Forbidden", 403);

    await prisma.quiz.delete({ where: { id } });
    return ok({ success: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}
