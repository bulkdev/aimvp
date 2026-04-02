import { NextResponse } from "next/server";
import { listProjects } from "@/lib/store";
import type { ApiError } from "@/types";

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json<ApiError>(
      { error: "Failed to load projects." },
      { status: 500 }
    );
  }
}
