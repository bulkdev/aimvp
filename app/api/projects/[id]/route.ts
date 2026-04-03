import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessProject } from "@/lib/project-access";
import { getProject, updateProject } from "@/lib/store";
import type { ApiError, Project } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<ApiError>({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json<ApiError>({ error: "Project not found." }, { status: 404 });
  }
  if (!canAccessProject(project, { id: session.user.id, email: session.user.email || "" })) {
    return NextResponse.json<ApiError>({ error: "Forbidden." }, { status: 403 });
  }
  return NextResponse.json<{ project: Project }>({ project });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiError>({ error: "Unauthorized." }, { status: 401 });
    }
    const { id } = await params;
    const existing = await getProject(id);
    if (!existing) {
      return NextResponse.json<ApiError>({ error: "Project not found." }, { status: 404 });
    }
    if (!canAccessProject(existing, { id: session.user.id, email: session.user.email || "" })) {
      return NextResponse.json<ApiError>({ error: "Forbidden." }, { status: 403 });
    }
    const raw = (await req.json()) as Record<string, unknown>;
    delete raw.ownerId;
    const updated = await updateProject(
      id,
      raw as Partial<Pick<Project, "intake" | "content" | "status" | "publicSlug">>
    );
    if (!updated) {
      return NextResponse.json<ApiError>({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json<{ project: Project }>({ project: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("URL slug") ||
      message.includes("slug is already") ||
      message.includes("reserved URL")
    ) {
      return NextResponse.json<ApiError>({ error: message }, { status: 400 });
    }
    return NextResponse.json<ApiError>(
      { error: "Failed to update project.", details: message },
      { status: 500 }
    );
  }
}

