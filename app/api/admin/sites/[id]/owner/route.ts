import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createUser, getUserByEmail } from "@/lib/auth-users";
import { isMainAdminEmail } from "@/lib/admin-env";
import { getProject, updateProject } from "@/lib/store";
import type { ApiError, Project } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email || !isMainAdminEmail(session.user.email)) {
    return NextResponse.json<ApiError>({ error: "Forbidden." }, { status: 403 });
  }

  const { id: projectId } = await params;
  const project = await getProject(projectId);
  if (!project) {
    return NextResponse.json<ApiError>({ error: "Project not found." }, { status: 404 });
  }

  const body = (await req.json()) as { email?: string; password?: string; name?: string };
  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json<ApiError>({ error: "Email is required." }, { status: 400 });
  }

  let user = await getUserByEmail(email);
  if (!user) {
    const pw = body.password ?? "";
    if (pw.length < 8) {
      return NextResponse.json<ApiError>(
        {
          error:
            "No account for that email. Add a password (min 8 characters) to create one and assign as owner.",
        },
        { status: 400 }
      );
    }
    try {
      user = await createUser({ email, password: pw, name: body.name?.trim() || undefined });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not create user.";
      return NextResponse.json<ApiError>({ error: message }, { status: 400 });
    }
  }

  const updated = await updateProject(projectId, { ownerId: user.id });
  if (!updated) {
    return NextResponse.json<ApiError>({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json<{ project: Project; ownerEmail: string }>({
    project: updated,
    ownerEmail: user.email,
  });
}
