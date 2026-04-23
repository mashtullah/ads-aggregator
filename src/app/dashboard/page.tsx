import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/prisma"
import Link from 'next/link'

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const store = await db.store.findUnique({
    where: { userId: session.user.id },
    include: { 
       products: { 
          include: { ads: true },
          orderBy: { createdAt: 'desc' } 
       } 
    }
  });
  
  if (!store) return <div>Store not found</div>;

  // Predict dummy engagement levels scaling against physical items mapped
  const totalViews = store.products.length * 1425;
  const publishedAdsCount = store.products.reduce((acc, p) => acc + p.ads.filter(a => a.status === 'PUBLISHED').length, 0);

  return (
    <div className="container animate-fade-in mt-8 mb-8">
      <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Welcome, {session.user?.name}</h2>
          <p>Store: {store?.name} <Link href={`/store/${store?.slug}`} className="btn-outline" style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginLeft: '0.5rem', textDecoration: 'none' }}>View Store</Link></p>
        </div>
        <Link href="/dashboard/products/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>Add New Product</Link>
      </div>
      
      <div className="flex gap-4 mt-8" style={{ flexWrap: 'wrap' }}>
        <div className="glass-panel flex-col justify-center" style={{ padding: '2rem', flex: '1 1 200px' }}>
          <h3>Total Views</h3>
          <h2 style={{ color: 'var(--primary)' }}>{totalViews.toLocaleString()}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>+14% this week</span>
        </div>
        <div className="glass-panel flex-col justify-center" style={{ padding: '2rem', flex: '1 1 200px' }}>
          <h3>Active Ads</h3>
          <h2 style={{ color: 'var(--secondary)' }}>{publishedAdsCount}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>via Meta Interface</span>
        </div>
        <div className="glass-panel flex-col justify-center" style={{ padding: '2rem', flex: '1 1 200px' }}>
          <h3>Products</h3>
          <h2 style={{ color: 'var(--accent)' }}>{store?.products.length || 0}</h2>
        </div>
      </div>
      
      <div className="glass-panel mt-8" style={{ padding: '2rem' }}>
        <h3>Your Products</h3>
        {store?.products && store.products.length > 0 ? (
          <div className="flex flex-col gap-4 mt-4">
            {store.products.map(p => {
               const hasPublishedAd = p.ads.some(a => a.status === 'PUBLISHED');
               
               return (
                  <div key={p.id} className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap', gap:'1rem' }}>
                     <div className="flex gap-4 items-center">
                        {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />}
                        <div>
                           <h4>{p.name} {hasPublishedAd && <span style={{fontSize: '0.7rem', background: 'var(--primary)', color: 'black', padding: '0.1rem 0.6rem', borderRadius:'9999px', verticalAlign:'middle', marginLeft: '0.5rem'}}>Selling on Meta</span>}</h4>
                           <p style={{ fontSize: '0.9rem' }}>KES {p.price}</p>
                        </div>
                     </div>
                     <Link href={`/dashboard/products/${p.id}/ad`} className="btn btn-secondary" style={{ textDecoration: 'none' }}>AI Ad Module</Link>
                  </div>
               )
            })}
          </div>
        ) : (
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>You haven't added any products yet.</p>
        )}
      </div>
    </div>
  )
}
