import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Get the current session on the server (pages / API routes / server components).
 * Returns null when unauthenticated.
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session ?? null;
}

/**
 * Same as getServerSession but throws a 401 Response if unauthenticated.
 * Use inside API route handlers that require auth.
 */
export async function requireSession() {
  const session = await getServerSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}
