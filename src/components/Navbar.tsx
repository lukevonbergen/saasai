"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet";
import { Menu, LayoutDashboard, Rocket, Users, HelpCircle } from "lucide-react";

const navItems = [
  {
    title: "Products",
    links: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        description: "Real-time automation insights",
        href: "/dashboard",
      },
      {
        name: "Launchpad",
        icon: Rocket,
        description: "Deploy workflows in seconds",
        href: "/launchpad",
      },
    ],
  },
  {
    title: "Solutions",
    links: [
      {
        name: "Teams",
        icon: Users,
        description: "Collaborate and manage access",
        href: "/teams",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        name: "Docs",
        icon: HelpCircle,
        description: "Everything you need to get started",
        href: "/docs",
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        name: "About",
        icon: Users,
        description: "Meet the team and mission",
        href: "/about",
      },
    ],
  },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-white">
          AutoFlow
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-4">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuTrigger className="text-white hover:text-gray-200">
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white p-4 rounded-md shadow-md min-w-[300px]">
                    <ul className="grid gap-3">
                      {item.links.map((link) => (
                        <li key={link.name}>
                          <Link
                            href={link.href}
                            className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100"
                          >
                            <link.icon className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{link.name}</p>
                              <p className="text-xs text-gray-600">{link.description}</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Link
            href="/login"
            className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-100 text-sm font-medium"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </SheetTrigger>
          <SheetContent side="left" className="p-4 bg-white">
            <h2 className="text-xl font-bold mb-4">AutoFlow</h2>
            <nav className="space-y-6">
              {navItems.map((item) => (
                <div key={item.title}>
                  <p className="text-sm font-semibold mb-2 text-gray-900">{item.title}</p>
                  <ul className="space-y-2">
                    {item.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-2 text-sm text-gray-700 hover:text-black"
                        >
                          <link.icon className="w-4 h-4 text-gray-500" />
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Link
                href="/login"
                className="block w-full text-center bg-black text-white py-2 rounded-md"
              >
                Login
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}