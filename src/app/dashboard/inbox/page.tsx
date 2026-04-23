import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';

export default async function Inbox() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const store = await db.store.findUnique({
    where: { userId: session.user.id },
    include: {
      messages: {
        include: { sender: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!store) redirect('/dashboard');

  return (
    <div className="container animate-fade-in mt-8 mb-8">
      <div className="flex gap-4 items-center mb-8">
        <Link href="/dashboard" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>&larr; Back</Link>
        <h2>Customer Inquiries</h2>
      </div>

      <div className="flex flex-col gap-4">
        {store.messages.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No messages yet. They will appear here when buyers contact your store.</p>
          </div>
        ) : (
          store.messages.map(msg => (
            <div key={msg.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: msg.isRead ? 'none' : '4px solid var(--primary)' }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 style={{ margin: 0 }}>{msg.sender.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                {!msg.isRead && <span className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.6rem' }}>NEW</span>}
              </div>
              <p style={{ marginTop: '0.5rem' }}>{msg.content}</p>
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reply to: {msg.sender.email}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
