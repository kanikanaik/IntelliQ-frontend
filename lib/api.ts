import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(e: unknown) {
  if (e instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation error", details: e.flatten().fieldErrors },
      { status: 400 }
    );
  }
  console.error(e);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
