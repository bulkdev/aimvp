import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessProject } from "@/lib/project-access";
import { getProject, importProject } from "@/lib/store";
import type { ApiError, Project } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiError>({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await req.json()) as { project?: unknown };
    const raw = body?.project;
    if (!raw || typeof raw !== "object") {
      return NextResponse.json<ApiError>({ error: "Request body must include a project object." }, { status: 400 });
    }

    const maybeId = (raw as { id?: unknown }).id;
    if (typeof maybeId !== "string" || !maybeId.trim()) {
      return NextResponse.json<ApiError>({ error: "Backup must include a non-empty project id." }, { status: 400 });
    }

    const existing = await getProject(maybeId);
    if (existing) {
      if (!canAccessProject(existing, { id: session.user.id, email: session.user.email || "" })) {
        return NextResponse.json<ApiError>({ error: "Forbidden." }, { status: 403 });
      }
    }

    const saved = await importProject(raw as Project, { ownerId: session.user.id });
    return NextResponse.json<{ project: Project }>({ project: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("URL slug") ||
      message.includes("slug is already") ||
      message.includes("reserved") ||
      message.includes("Invalid")
    ) {
      return NextResponse.json<ApiError>({ error: message }, { status: 400 });
    }
    return NextResponse.json<ApiError>(
      { error: "Failed to import project.", details: message },
      { status: 500 }
    );
  }
}
