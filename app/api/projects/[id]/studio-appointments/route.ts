import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessProject } from "@/lib/project-access";
import { getProject } from "@/lib/store";
import { resolveSiteVariant } from "@/lib/siteVariant";
import {
  listStudioAppointments,
  updateStudioAppointmentStatus,
  type StudioAppointmentRecord,
} from "@/lib/studio-appointment-store";
import type { ApiError } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

function sortAppointments(rows: StudioAppointmentRecord[]): StudioAppointmentRecord[] {
  return [...rows].sort((a, b) => {
    const d = b.dateIso.localeCompare(a.dateIso);
    if (d !== 0) return d;
    return b.createdAt.localeCompare(a.createdAt);
  });
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
  const variant = resolveSiteVariant(
    project.intake.businessDescription,
    project.intake.siteTemplate ?? "auto",
    project.intake.companyName
  );
  if (variant !== "hairDesignStudio") {
    return NextResponse.json<ApiError>({ error: "Not a hair studio site." }, { status: 400 });
  }
  const appointments = sortAppointments(await listStudioAppointments(id));
  return NextResponse.json({ appointments });
}

export async function PATCH(req: NextRequest, { params }: Params) {
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
  const variant = resolveSiteVariant(
    project.intake.businessDescription,
    project.intake.siteTemplate ?? "auto",
    project.intake.companyName
  );
  if (variant !== "hairDesignStudio") {
    return NextResponse.json<ApiError>({ error: "Not a hair studio site." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiError>({ error: "Invalid JSON." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const appointmentId = typeof b.appointmentId === "string" ? b.appointmentId.trim() : "";
  const status = b.status === "confirmed" || b.status === "cancelled" ? b.status : null;
  if (!appointmentId || !status) {
    return NextResponse.json<ApiError>({ error: "appointmentId and status (confirmed|cancelled) required." }, { status: 400 });
  }

  const updated = await updateStudioAppointmentStatus(id, appointmentId, status);
  if (!updated) {
    return NextResponse.json<ApiError>({ error: "Appointment not found." }, { status: 404 });
  }
  return NextResponse.json({ appointment: updated });
}
