import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { createQuizSchema } from "@/lib/validations";
import { ok, err, handleError } from "@/lib/api";

// GET /api/quiz — list published quizzes (+ owner's own drafts)
export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "true";

    const quizzes = await prisma.quiz.findMany({
      where: mine
        ? { createdBy: session.user.id }
        : { isPublished: true },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(quizzes);
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}

// POST /api/quiz — create a new quiz
export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = createQuizSchema.parse(await request.json());

    const quiz = await prisma.quiz.create({
      data: {
        ...body,
        createdBy: session.user.id,
      },
    });

    return ok(quiz, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}
