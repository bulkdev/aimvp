import { notFound } from "next/navigation";
import { getProject } from "@/lib/store";
import OwnerDashboard from "@/components/admin/OwnerDashboard";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
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

