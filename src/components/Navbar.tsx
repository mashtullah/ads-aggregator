import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LogoutButton from './LogoutButton';

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="navbar">
      <div className="container flex justify-between items-center">
        <Link href="/" className="logo">
          Oskid<span style={{ color: "var(--primary)" }}>o.</span>
        </Link>
        
        <div className="flex gap-4 items-center">
          <Link href="/marketplace" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>
            Marketplace
          </Link>
          
          {session ? (
            <>
              {(session.user as any).role === 'ADMIN' && (
                <Link href="/admin/stores" className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                   Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn btn-outline">
                Dashboard
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary">
                Create Store
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
