import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api";

// GET /api/leaderboard — global top scores across all quizzes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("quizId"); // optional: filter by quiz
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 100);

    const top = await prisma.attempt.findMany({
      where: {
        completedAt: { not: null },
        ...(quizId ? { quizId } : {}),
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        quiz: { select: { id: true, title: true } },
      },
      orderBy: [{ score: "desc" }, { timeTaken: "asc" }],
      take: limit,
    });

    const ranked = top.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      userName: entry.user?.name ?? "Anonymous",
      userImage: entry.user?.image ?? null,
      quizId: entry.quizId,
      quizTitle: entry.quiz.title,
      score: entry.score,
      totalPoints: entry.totalPoints,
      percentage:
        entry.totalPoints > 0
          ? Math.round((entry.score / entry.totalPoints) * 100)
          : 0,
      timeTaken: entry.timeTaken,
    }));

    return ok(ranked);
  } catch (e) {
    return handleError(e);
  }
}
