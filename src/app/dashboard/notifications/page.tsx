import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Notifications() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container animate-fade-in mt-8 mb-8">
      <div className="flex gap-4 items-center mb-8">
        <Link href="/dashboard" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>&larr; Back</Link>
        <h2>Recent Activity</h2>
      </div>

      <div className="flex flex-col gap-4">
        {notifications.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No recent notifications.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className="glass-panel" style={{ padding: '1.5rem', opacity: notif.isRead ? 0.7 : 1 }}>
              <h4 style={{ margin: 0, color: 'var(--secondary)' }}>{notif.title}</h4>
              <p style={{ marginTop: '0.5rem' }}>{notif.message}</p>
              <div className="flex justify-between items-center mt-3">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(notif.createdAt).toLocaleTimeString()}
                </span>
                {notif.link && (
                  <Link href={notif.link} className="btn-outline" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', textDecoration: 'none' }}>
                     View Details &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
