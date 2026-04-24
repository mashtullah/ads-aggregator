import { db } from "@/lib/prisma";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminStores() {
  const stores = await db.store.findMany({
    include: {
        user: true,
        _count: { select: { products: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2>Global Store Management</h2>
        <span className="glass-panel" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            TOTAL STORES: **{stores.length}**
        </span>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '1.2rem' }}>Store Name</th>
              <th style={{ padding: '1.2rem' }}>Owner</th>
              <th style={{ padding: '1.2rem' }}>Status</th>
              <th style={{ padding: '1.2rem' }}>Products</th>
              <th style={{ padding: '1.2rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => (
              <tr key={store.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.2rem' }}>
                  <div style={{ fontWeight: 'bold' }}>{store.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{store.slug}</div>
                </td>
                <td style={{ padding: '1.2rem' }}>{store.user.email}</td>
                <td style={{ padding: '1.2rem' }}>
                  {store.isVerified ? 
                    <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>✓ Verified</span> : 
                    <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>Unverified</span>}
                </td>
                <td style={{ padding: '1.2rem' }}>{store._count.products}</td>
                <td style={{ padding: '1.2rem' }}>
                   <Link href={`/admin/stores/${store.id}/edit`} className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', textDecoration: 'none', borderRadius: '4px' }}>
                     Edit / Reset
                   </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
