import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Sidebar from "@/components/user-dashboard/Sidebar";
import ClientShell from "@/components/user-dashboard/ClientShell";

export default async function DashboardLayout({ children }: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <ClientShell>{children}</ClientShell>
      </main>
    </div>
  );
}