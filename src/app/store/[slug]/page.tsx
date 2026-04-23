import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import MessageForm from "./MessageForm";

export const dynamic = 'force-dynamic';

export default async function StorePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  const store = await db.store.findUnique({
    where: { slug: params.slug },
    include: { 
      products: { orderBy: { createdAt: 'desc' } }, 
      user: true,
      reviews: true
    }
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="container animate-fade-in mt-8 mb-8" style={{ maxWidth: '900px' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="flex justify-center items-center gap-2 mb-2">
           <h2 style={{ margin: 0 }}>{store.name}</h2>
           {store.isVerified && (
             <span title="Verified Seller" style={{ background: 'var(--primary)', color: 'black', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>VERIFIED</span>
           )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', color: '#ffc107', marginBottom: '1rem' }}>
           {'★'.repeat(Math.round(store.averageRating))}{'☆'.repeat(5 - Math.round(store.averageRating))}
           <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({store.reviews.length} reviews)</span>
        </div>

        <p style={{ marginTop: '1rem' }}>{store.description || `Welcome to the official store of ${store.user.name}.`}</p>
        
        <div className="flex justify-center gap-4 mt-6">
          <a href={store.whatsappNumber ? `https://wa.me/${store.whatsappNumber}` : '#'} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ borderRadius: 'var(--radius-full)', textDecoration: 'none' }}>
             WhatsApp Chat
          </a>
          <MessageForm storeId={store.id} isAuthenticated={!!session} />
        </div>
      </div>

      <div className="mt-12">
        <h3>Products ({store.products.length})</h3>
        <div className="flex mt-4" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
          {store.products.map(product => (
            <div key={product.id} className="glass-panel" style={{ flex: '1 1 250px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '8px', marginBottom: '1rem', background: '#111' }}>
                <img src={product.imageUrl || '/placeholder-img.png'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h4>{product.name}</h4>
              <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>KES {product.price}</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', flex: 1, color: 'var(--text-muted)' }}>{product.description?.substring(0, 80)}...</p>
              <button className="btn btn-primary mt-4" style={{ width: '100%' }}>Buy via IntaSend</button>
            </div>
          ))}
        </div>
        
        {store.products.length === 0 && (
           <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>This store has no products yet.</p>
        )}
      </div>
    </div>
  );
}
