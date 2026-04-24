'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminEditStore() {
  const params = useParams();
  const router = useRouter();
  const storeId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetch(`/api/admin/stores/${storeId}`)
      .then(res => res.json())
      .then(data => setStore(data.store));
  }, [storeId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/stores/${storeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          name: store.name, 
          isVerified: store.isVerified,
          newPassword: newPassword || undefined
      })
    });
    if (res.ok) router.push('/admin/stores');
    setLoading(false);
  };

  if (!store) return <div className="animate-pulse">Loading Audit Logs...</div>;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '700px' }}>
      <div className="flex gap-4 items-center mb-8">
        <Link href="/admin/stores" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>&larr; Back</Link>
        <h2>Audit Store: {store.name}</h2>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleUpdate}>
           <div className="mb-6">
              <label className="label">Owner Email (Account Registry)</label>
              <input className="input" value={store.user.email} disabled style={{ opacity: 0.6 }} />
           </div>

           <div className="mb-6">
              <label className="label">Store Display Name</label>
              <input 
                className="input" 
                value={store.name} 
                onChange={e => setStore({...store, name: e.target.value})} 
              />
           </div>

           <div className="mb-6">
             <label style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="checkbox" 
                  checked={store.isVerified} 
                  onChange={e => setStore({...store, isVerified: e.target.checked})}
                />
                Verified Merchant Credentials
             </label>
           </div>

           <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />
           
           <div className="mb-8">
              <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>🔐 Account Override</h4>
              <p className="mb-4" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Force reset the owner's password below. They will be logged out immediately.</p>
              <label className="label">Force New Password</label>
              <input 
                type="password" 
                className="input" 
                placeholder="Enter new global password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
           </div>

           <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Committing Changes...' : 'Save Audit Adjustments'}
           </button>
        </form>
      </div>
    </div>
  );
}
