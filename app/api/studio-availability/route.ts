import { NextResponse } from "next/server";
import { getProject } from "@/lib/store";
import { resolveSiteVariant } from "@/lib/siteVariant";
import { listStudioAppointments } from "@/lib/studio-appointment-store";
import {
  bookingSlotConflicts,
  generateStudioTimeLabelsForDay,
  isStudioOpenOnDay,
  parseDateIsoLocal,
} from "@/lib/studio-scheduling";

function trimStr(v: string | null, max: number): string {
  return (v || "").trim().slice(0, max);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = trimStr(url.searchParams.get("projectId"), 80);
  const locationId = trimStr(url.searchParams.get("locationId"), 80);
  const dateIso = trimStr(url.searchParams.get("dateIso"), 32);
  const stylistId = trimStr(url.searchParams.get("stylistId"), 80);

  if (!projectId || !locationId || !dateIso) {
    return NextResponse.json({ error: "projectId, locationId, and dateIso are required." }, { status: 400 });
  }

  const project = await getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const variant = resolveSiteVariant(
    project.intake.businessDescription,
    project.intake.siteTemplate ?? "auto",
    project.intake.companyName
  );
  if (variant !== "hairDesignStudio") {
    return NextResponse.json({ error: "Availability is not enabled for this template." }, { status: 400 });
  }

  const cfg = project.content.assets?.hairDesignStudio;
  const loc = cfg?.locations?.find((l) => l.id === locationId);
  if (!loc) {
    return NextResponse.json({ error: "Invalid location." }, { status: 400 });
  }

  if (stylistId) {
    const st = cfg?.stylists?.find((s) => s.id === stylistId);
    if (!st) {
      return NextResponse.json({ error: "Invalid stylist." }, { status: 400 });
    }
  }

  const dt = parseDateIsoLocal(dateIso);
  if (!dt) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  if (!isStudioOpenOnDay(dt.getDay())) {
    return NextResponse.json({ slots: [], closed: true });
  }

  const existing = await listStudioAppointments(projectId);
  const labels = generateStudioTimeLabelsForDay();
  const slots = labels.map((timeLabel) => ({
    timeLabel,
    available: !bookingSlotConflicts(existing, {
      locationId,
      dateIso,
      timeLabel,
      stylistId,
    }),
  }));

  return NextResponse.json({ slots, closed: false });
}
