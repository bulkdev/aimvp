import { NextRequest, NextResponse } from "next/server";
import { generateSiteContent } from "@/lib/generator";
import { createProject } from "@/lib/store";
import type { GenerateRequest, GenerateResponse, ApiError } from "@/types";

export const maxDuration = 60; // allow up to 60s for OpenAI calls

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequest;

    // Basic validation
    if (!body?.intake?.companyName?.trim()) {
      return NextResponse.json<ApiError>(
        { error: "Company name is required." },
        { status: 400 }
      );
    }
    if (!body?.intake?.businessDescription?.trim()) {
      return NextResponse.json<ApiError>(
        { error: "Business description is required." },
        { status: 400 }
      );
    }

    // Generate content (mock or real AI)
    const content = await generateSiteContent(body.intake);

    // Persist project
    const project = await createProject(body.intake, content);

    return NextResponse.json<GenerateResponse>({
      projectId: project.id,
      content,
    });
  } catch (err) {
    console.error("[/api/generate] Error:", err);
    return NextResponse.json<ApiError>(
      {
        error: "Failed to generate website. Please try again.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
