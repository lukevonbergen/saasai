"use client";

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Branding */}
        <div>
          <h2 className="text-xl font-bold mb-2">AutoFlow</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered backend automation for modern SaaS.
          </p>
        </div>

        {/* Column 2: Product */}
        <div>
          <h3 className="text-sm font-semibold mb-2 uppercase">Product</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/dashboard" className="hover:underline">Dashboard</Link></li>
            <li><Link href="/launchpad" className="hover:underline">Launchpad</Link></li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div>
          <h3 className="text-sm font-semibold mb-2 uppercase">Company</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/about" className="hover:underline">About</Link></li>
            <li><Link href="/careers" className="hover:underline">Careers</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>

        {/* Column 4: Resources */}
        <div>
          <h3 className="text-sm font-semibold mb-2 uppercase">Resources</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/docs" className="hover:underline">Documentation</Link></li>
            <li><Link href="/support" className="hover:underline">Support</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="text-xs text-center text-muted-foreground pb-6">
        © {new Date().getFullYear()} AutoFlow. All rights reserved.
      </div>
    </footer>
  )
}