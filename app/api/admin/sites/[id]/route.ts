import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isMainAdminEmail } from "@/lib/admin-env";
import { deleteProject, getProject, getProjectByPublicSlug } from "@/lib/store";
import type { ApiError } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email || !isMainAdminEmail(session.user.email)) {
    return NextResponse.json<ApiError>({ error: "Forbidden." }, { status: 403 });
  }

  const { id: raw } = await params;
  let target = await getProject(raw);
  if (!target) target = (await getProjectByPublicSlug(raw)) ?? null;
  if (!target) {
    return NextResponse.json<ApiError>({ error: "Project not found." }, { status: 404 });
  }

  try {
    const ok = await deleteProject(target.id);
    if (!ok) {
      return NextResponse.json<ApiError>({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed.";
    return NextResponse.json<ApiError>({ error: message }, { status: 500 });
  }
}
