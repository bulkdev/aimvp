import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/lib/auth-users";
import { isMainAdminEmail } from "@/lib/admin-env";
import { listProjects } from "@/lib/store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isMainAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const projects = await listProjects();
  const sites = await Promise.all(
    projects.map(async (p) => {
      let ownerEmail: string | null = null;
      if (p.ownerId) {
        const u = await getUserById(p.ownerId);
        ownerEmail = u?.email ?? null;
      }
      return {
        id: p.id,
        brandName: p.content.brandName,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        ownerId: p.ownerId ?? null,
        ownerEmail,
        publicSlug: p.publicSlug ?? null,
        status: p.status,
      };
    })
  );

  return NextResponse.json({ sites });
}
