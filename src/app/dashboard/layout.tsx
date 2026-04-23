import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const store = await db.store.findUnique({
    where: { userId: session.user.id }
  });

  if (!store) return <>{children}</>;

  // 30 days trial logic
  const now = new Date();
  const createdAt = new Date(store.createdAt);
  const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24));
  
  const isTrialExpired = diffDays > 30 && !store.isSubscribed;

  if (isTrialExpired) {
    return (
      <div className="container animate-fade-in mt-8 text-center" style={{ padding: '4rem 0' }}>
         <h2 style={{ color: 'var(--accent)' }}>Subscription Required.</h2>
         <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Your 30-day free trial limit has been reached. Please upgrade to continue accessing Oskido's features natively.</p>
         <Link href="/dashboard/billing" className="btn btn-primary mt-8" style={{ textDecoration: 'none' }}>Activate Subscription</Link>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}
