import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function StorePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;

  const store = await db.store.findUnique({
    where: { slug: params.slug },
    include: { products: { orderBy: { createdAt: 'desc' } }, user: true }
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="container animate-fade-in mt-8 mb-8" style={{ maxWidth: '900px' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>{store.name}</h2>
        <p style={{ marginTop: '1rem' }}>Welcome to the personal store of {store.user.name}. Browse my products below.</p>
        <a href={store.whatsappNumber ? `https://wa.me/${store.whatsappNumber}` : '#'} target="_blank" rel="noreferrer" className="btn btn-outline mt-4" style={{ borderRadius: 'var(--radius-full)', textDecoration: 'none' }}>
           WhatsApp Chat
        </a>
      </div>

      <div className="mt-8">
        <h3>Products ({store.products.length})</h3>
        <div className="flex mt-4" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
          {store.products.map(product => (
            <div key={product.id} className="glass-panel" style={{ flex: '1 1 250px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              {product.imageUrl && (
                <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '8px', marginBottom: '1rem' }}>
                   <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
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
