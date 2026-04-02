import { notFound } from "next/navigation";
import { getProject } from "@/lib/store";
import PreviewShell from "@/components/preview/PreviewShell";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return <PreviewShell project={project} />;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);
  return {
    title: project ? `${project.content.brandName} — Preview` : "Preview",
  };
}
