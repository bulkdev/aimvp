import { forbidden } from "next/navigation";
import { auth } from "@/auth";
import { isMainAdminEmail } from "@/lib/admin-env";
import AdminGenerateView from "@/components/admin/AdminGenerateView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generate site",
  robots: { index: false, follow: false },
};

export default async function AdminGeneratePage() {
  const session = await auth();
  if (!session?.user?.id) {
    forbidden();
  }
  if (!session.user.email || !isMainAdminEmail(session.user.email)) {
    forbidden();
  }
  return <AdminGenerateView />;
}
