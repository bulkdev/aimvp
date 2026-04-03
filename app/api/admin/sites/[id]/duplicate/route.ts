import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isMainAdminEmail } from "@/lib/admin-env";
import { duplicateProject, getProject, getProjectByPublicSlug } from "@/lib/store";
import type { ApiError, Project } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email || !isMainAdminEmail(session.user.email)) {
    return NextResponse.json<ApiError>({ error: "Forbidden." }, { status: 403 });
  }

  const { id: raw } = await params;
  let source = await getProject(raw);
  if (!source) source = (await getProjectByPublicSlug(raw)) ?? null;
  if (!source) {
    return NextResponse.json<ApiError>({ error: "Project not found." }, { status: 404 });
  }

  try {
    const project = await duplicateProject(source.id);
    if (!project) {
      return NextResponse.json<ApiError>({ error: "Could not duplicate project." }, { status: 500 });
    }
    return NextResponse.json<{ project: Project }>({ project });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Duplicate failed.";
    return NextResponse.json<ApiError>({ error: message }, { status: 500 });
  }
}
