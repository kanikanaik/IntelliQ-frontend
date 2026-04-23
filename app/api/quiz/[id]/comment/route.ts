import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { commentSchema } from "@/lib/validations";
import { ok, err, handleError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// GET /api/quiz/[id]/comment
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const comments = await prisma.comment.findMany({
      where: { quizId: id },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok(comments);
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/quiz/[id]/comment
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await requireSession();

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) return err("Quiz not found", 404);

    const { text } = commentSchema.parse(await request.json());

    const comment = await prisma.comment.create({
      data: { quizId: id, userId: session.user.id, text },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return ok(comment, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}
