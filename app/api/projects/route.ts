import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listProjectsForSessionUser } from "@/lib/project-access";
import type { ApiError } from "@/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiError>({ error: "Unauthorized." }, { status: 401 });
    }
    const projects = await listProjectsForSessionUser({
      id: session.user.id,
      email: session.user.email || "",
    });
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json<ApiError>(
      { error: "Failed to load projects." },
      { status: 500 }
    );
  }
}
