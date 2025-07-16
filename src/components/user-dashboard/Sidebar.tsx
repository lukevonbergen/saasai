"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Flows", href: "/dashboard/flows" },
  { label: "Create Flow", href: "/dashboard/create" },
  { label: "Run History", href: "/dashboard/history" },
  { label: "Notifications", href: "/dashboard/notifications" },
  { label: "Usage", href: "/dashboard/usage" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Team", href: "/dashboard/team" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setEmail(session?.user?.email || null);
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // redirect to login after logout
  };

  return (
    <aside className="w-64 bg-white border-r h-full p-4 flex flex-col justify-between">
      <div>
        <nav className="space-y-2">
          {links.map(link => (
            <Link key={link.href} href={link.href}>
              <span
                className={`block px-4 py-2 rounded hover:bg-gray-100 transition ${
                  pathname === link.href ? "bg-gray-200 font-semibold" : ""
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="text-sm text-gray-600 border-t pt-4 mt-4 space-y-2">
        {email && (
          <>
            <div>
              Logged in as<br />
              <span className="font-medium">{email}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-sm"
            >
              Log out
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}