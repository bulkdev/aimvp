import { notFound, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { canAccessProject } from "@/lib/project-access";
import { getProject, getProjectByPublicSlug } from "@/lib/store";
import OwnerDashboard from "@/components/admin/OwnerDashboard";
import HairStudioOwnerDashboard from "@/components/admin/hair-studio/HairStudioOwnerDashboard";
import { resolveSiteVariant } from "@/lib/siteVariant";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ full?: string }>;
}

export default async function AdminPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    forbidden();
  }
  const { id: raw } = await params;
  const sp = searchParams ? await searchParams : {};
  const forceFullEditor = sp.full === "1";
  let project = await getProject(raw);
  if (!project) project = await getProjectByPublicSlug(raw);
  if (!project) notFound();
  if (!canAccessProject(project, { id: session.user.id, email: session.user.email || "" })) {
    forbidden();
  }
  const variant = resolveSiteVariant(
    project.intake.businessDescription,
    project.intake.siteTemplate ?? "auto",
    project.intake.companyName
  );
  if (variant === "hairDesignStudio" && !forceFullEditor) {
    return <HairStudioOwnerDashboard project={project} />;
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

