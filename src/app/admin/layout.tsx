import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Strictly gate the entire /admin path to role: 'ADMIN'
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <aside className="glass-panel" style={{ width: '260px', borderRadius: 0, borderRight: '1px solid var(--border)', padding: '2rem 1rem' }}>
        <h3 className="mb-8 px-4" style={{ color: 'var(--primary)', letterSpacing: '0.1rem' }}>SUPER ADMIN</h3>
        <nav className="flex flex-col gap-2">
           <Link href="/admin/stores" className="btn btn-outline" style={{ justifyContent: 'start', border: 'none', textAlign: 'left' }}>
             📦 Manage Stores
           </Link>
           <Link href="/admin/users" className="btn btn-outline" style={{ justifyContent: 'start', border: 'none', textAlign: 'left' }}>
             👥 User Accounts
           </Link>
           <Link href="/dashboard" className="btn btn-outline" style={{ justifyContent: 'start', border: 'none', textAlign: 'left', marginTop: '2rem' }}>
             &larr; Exit Admin
           </Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
