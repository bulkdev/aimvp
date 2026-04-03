import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessProject } from "@/lib/project-access";
import { getProject, updateProject } from "@/lib/store";
import { mergeBlobSlice } from "@/lib/projectExportSplit";
import type { ApiError, Project } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * Apply a chunk of image blobs onto a project that still contains `__SITEGEN_BLOB__:n` placeholders
 * (split backup import). Chunks keep each request body under platform limits.
 */
export async function POST(req: NextRequest, { params }: Params) {
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

    const body = (await req.json()) as { startIndex?: number; blobs?: unknown };
    const startIndex = Math.max(0, Math.floor(Number(body.startIndex ?? 0)));
    const blobs = body.blobs;
    if (!Array.isArray(blobs) || blobs.length === 0) {
      return NextResponse.json<ApiError>({ error: "Non-empty blobs array required." }, { status: 400 });
    }
    if (!blobs.every((b) => typeof b === "string")) {
      return NextResponse.json<ApiError>({ error: "Invalid blobs." }, { status: 400 });
    }

    const merged = mergeBlobSlice(existing, startIndex, blobs as string[]) as Project;
    const updated = await updateProject(id, {
      intake: merged.intake,
      content: merged.content,
      publicSlug: merged.publicSlug,
    });
    if (!updated) {
      return NextResponse.json<ApiError>({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json<{ ok: true; project: Project }>({ ok: true, project: updated });
  } catch (err) {
    return NextResponse.json<ApiError>(
      { error: "Failed to merge blobs.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
