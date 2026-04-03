import { notFound, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { canAccessProject } from "@/lib/project-access";
import { getProject, getProjectByPublicSlug } from "@/lib/store";
import OwnerDashboard from "@/components/admin/OwnerDashboard";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    forbidden();
  }
  const { id: raw } = await params;
  let project = await getProject(raw);
  if (!project) project = await getProjectByPublicSlug(raw);
  if (!project) notFound();
  if (!canAccessProject(project, { id: session.user.id, email: session.user.email || "" })) {
    forbidden();
  }
  return <OwnerDashboard project={project} />;
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

