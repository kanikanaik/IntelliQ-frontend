import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { ok, handleError } from "@/lib/api";

type SortMode = "recent" | "attempts" | "trending";

// GET /api/quizzes — list all published quizzes (for explore page)
// NO authentication required - public endpoint
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const requestedSort = searchParams.get("sort") || "recent";
    const sort: SortMode =
      requestedSort === "attempts" || requestedSort === "trending"
        ? requestedSort
        : "recent";

    // Try to get current user (optional)
    const session = await getServerSession();
    const userId = session?.user?.id;

    console.info("[quizzes] list request", { limit, offset, sort, userId });

    // Build order by clause based on sort parameter
    const orderByClause =
      sort === "attempts"
        ? [{ attempts: { _count: "desc" as const } }, { createdAt: "desc" as const }]
        : sort === "trending"
          ? [{ questions: { _count: "desc" as const } }, { createdAt: "desc" as const }]
          : [{ createdAt: "desc" as const }];

    const quizzes = await prisma.quiz.findMany({
      where: {
        isPublished: true,
        shareId: { not: null },
        // Exclude quizzes created by current user (if logged in)
        ...(userId && { createdBy: { not: userId } }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        shareId: true,
        creator: { select: { name: true, image: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: orderByClause,
      take: limit,
      skip: offset,
    });

    // Transform response to match frontend expectations
    const formattedQuizzes = quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      shareId: quiz.shareId,
      creator: quiz.creator.name || "Anonymous",
      questions: quiz._count.questions,
      attempts: quiz._count.attempts,
    }));

    console.info("[quizzes] list response", { count: formattedQuizzes.length });

    return ok({ quizzes: formattedQuizzes });
  } catch (e) {
    if (e instanceof Response) return e;
    return handleError(e);
  }
}
