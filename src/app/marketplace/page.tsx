import { db } from "@/lib/prisma";
import Link from "next/link";

import SearchHeader from "./SearchHeader";

export const dynamic = 'force-dynamic';

export default async function Marketplace(props: { searchParams: Promise<{ q?: string }> }) {
  const sParams = await props.searchParams;
  const qStr = sParams?.q || "";

  const products = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: qStr } },
        { description: { contains: qStr } },
        { brand: { contains: qStr } }
      ]
    },
    include: { store: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container animate-fade-in mt-8 mb-8">
      <SearchHeader searchParams={{ q: qStr }} />
      
      <div className="flex" style={{ flexWrap: 'wrap', gap: '1.5rem', marginTop: '2rem' }}>
        {products.map(product => (
          <div key={product.id} className="glass-panel" style={{ flex: '1 1 250px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            {product.imageUrl && (
              <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '8px', marginBottom: '1rem' }}>
                 <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h4>{product.name}</h4>
              <Link href={`/store/${product.store.slug}`} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                {product.store.name}
              </Link>
            </div>
            <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>KES {product.price}</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', flex: 1, color: 'var(--text-muted)' }}>{product.description?.substring(0, 80)}...</p>
            <button className="btn btn-primary mt-4" style={{ width: '100%' }}>View Product</button>
          </div>
        ))}
      </div>
      
      {products.length === 0 && (
         <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', width: '100%' }}>
            <p>No products have been listed yet! Be the first to start selling.</p>
         </div>
      )}
    </div>
  );
}
