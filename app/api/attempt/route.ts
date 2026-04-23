import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { ok, err, handleError } from "@/lib/api";
import { z } from "zod";

const startSchema = z.object({ 
  quizId: z.string().uuid().optional(),
  shareId: z.string().min(1).optional(),
}).refine(
  (data) => data.quizId || data.shareId,
  { message: "Either quizId or shareId is required" }
);

// POST /api/attempt — start a new attempt (authenticated or guest)
export async function POST(request: Request) {
  try {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return err("Invalid JSON body", 400);
    }

    const { quizId, shareId } = startSchema.parse(payload);

    // Try to get session (optional - for guests)
    const session = await getServerSession();
    const userId = session?.user?.id;

    console.info("[attempt-start] request", { userId, quizId, shareId });

    // Find quiz by quizId or shareId
    let quiz;
    if (quizId) {
      quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
      });
    } else if (shareId) {
      quiz = await prisma.quiz.findUnique({
        where: { shareId },
      });
    }

    if (!quiz) {
      console.warn("[attempt-start] quiz not found", { quizId, shareId });
      return err("Quiz not found", 404);
    }
    
    // Prevent creator from taking their own quiz
    if (userId && quiz.createdBy === userId) {
      console.warn("[attempt-start] creator blocked", { quizId: quiz.id, userId });
      return err("You cannot take your own quiz", 403);
    }

    // For public access (shareId), quiz must be published
    if (shareId && !quiz.isPublished) {
      console.warn("[attempt-start] share quiz not published", { quizId: quiz.id, shareId });
      return err("Quiz is not published", 403);
    }

    // For private access (quizId), the quiz must be published for non-owners.
    if (quizId && !quiz.isPublished && quiz.createdBy !== userId) {
      console.warn("[attempt-start] private quiz forbidden", { quizId: quiz.id, userId });
      return err("Quiz is not published", 403);
    }

    // Get total points from questions
    const questionCount = await prisma.question.count({
      where: { quizId: quiz.id },
    });

    console.info("[attempt-start] creating attempt", {
      quizId: quiz.id,
      totalPoints: questionCount,
      isGuest: !userId,
    });

    const attempt = await prisma.attempt.create({
      data: {
        ...(userId && { userId }), // Only set if userId exists
        quizId: quiz.id,
        totalPoints: questionCount,
      },
    });

    console.info("[attempt-start] success", { attemptId: attempt.id, quizId: quiz.id });
    return ok(attempt, 201);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("[attempt-start] error", e);
    return handleError(e);
  }
}
