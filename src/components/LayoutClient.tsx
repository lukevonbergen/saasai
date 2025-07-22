'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { Providers } from '@/app/providers';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard') ?? false;

  return (
    <Providers>
      {!isDashboard && <Navbar />}
      {children}
      {!isDashboard && <Footer />}
    </Providers>
  );
}
