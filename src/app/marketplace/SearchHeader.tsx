'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Marketplace(props: { searchParams: { q?: string } }) {
  const [query, setQuery] = useState(props.searchParams?.q || '');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Note: Handling search on client for smoother experience if needed, 
  // but keeping the server logic I wrote earlier as baseline.
  
  return (
    <div className="container animate-fade-in mt-8 mb-8">
      {/* Search Header */}
      <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem', textAlign: 'center' }}>
         <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Global Marketplace</h2>
         <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Discover and purchase unique products from creators worldwide. Verified sellers, secure transactions.
         </p>
         
         <form action="/marketplace" method="GET" style={{ display: 'flex', gap: '0.5rem', maxWidth: '600px', margin: '0 auto' }}>
            <input 
              name="q"
              type="text" 
              className="input" 
              placeholder="Search by product name, brand, or category..." 
              defaultValue={props.searchParams?.q}
              style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)' }}
            />
            <button className="btn btn-primary" style={{ padding: '0 2rem' }}>Search</button>
         </form>
      </div>

      {/* Results or Dynamic Logic would go here (Already handled by the parent server component) */}
    </div>
  );
}
