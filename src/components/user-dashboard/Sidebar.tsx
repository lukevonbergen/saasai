"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react"; // icons

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Flows", href: "/dashboard/flows" },
  { label: "Create Flow", href: "/dashboard/create" },
  { label: "Run History", href: "/dashboard/history" },
  { label: "Notifications", href: "/dashboard/notifications" },
  { label: "Connections", href: "/dashboard/connections" },
  { label: "Usage", href: "/dashboard/usage" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Team", href: "/dashboard/team" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setEmail(session?.user?.email || null);
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} size="icon">
          {isOpen ? <X /> : <Menu />}
        </Button>
        <span className="font-semibold">Menu</span>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 h-full w-64 bg-white border-r p-4 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
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

      {/* Backdrop for mobile menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
