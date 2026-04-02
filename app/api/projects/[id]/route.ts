import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProject } from "@/lib/store";
import type { ApiError, Project } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json<ApiError>({ error: "Project not found." }, { status: 404 });
  }
  return NextResponse.json<{ project: Project }>({ project });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Partial<Pick<Project, "intake" | "content" | "status">>;
    const updated = await updateProject(id, body);
    if (!updated) {
      return NextResponse.json<ApiError>({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json<{ project: Project }>({ project: updated });
  } catch (err) {
    return NextResponse.json<ApiError>(
      { error: "Failed to update project.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

