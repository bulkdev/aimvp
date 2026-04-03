import { forbidden } from "next/navigation";
import { auth } from "@/auth";
import { isMainAdminEmail } from "@/lib/admin-env";
import MainAdminDashboard from "@/components/admin/MainAdminDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — All sites",
  robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    forbidden();
  }
  if (!isMainAdminEmail(session.user.email)) {
    forbidden();
  }
  return <MainAdminDashboard />;
}
