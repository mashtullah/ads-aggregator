import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Oskido | AI Marketing & Creator Platform',
  description: 'AI-powered creator stores and marketplace. Generate ads for Meta effortlessly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <nav className="navbar">
            <div className="container flex justify-between items-center">
              <Link href="/" className="logo">
                Oskid<span style={{ color: "var(--primary)" }}>o.</span>
              </Link>
              <div className="flex gap-4 items-center">
                <Link href="/marketplace" className="btn-outline btn" style={{ border: 'none' }}>
                  Marketplace
                </Link>
                <Link href="/login" className="btn btn-outline">
                  Sign In
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Create Store
                </Link>
              </div>
            </div>
          </nav>
          <main className="main-content">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
