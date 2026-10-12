import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "@/lib/auth";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(
    JSON.parse(JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? Number(v) : v))),
    { status },
  );
}

export function fail(error: unknown) {
  if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message ?? "Data tidak valid.", issues: error.issues },
      { status: 422 },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
