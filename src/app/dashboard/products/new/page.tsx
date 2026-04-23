'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    price: '',
    brand: '',
    description: '',
    isDigital: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let imageUrl = '';

    try {
      // 1. Upload Image
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.url;
        } else {
          throw new Error('Image upload failed');
        }
      }

      // 2. Create Product
      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl }),
      });

      if (productRes.ok) {
        router.push('/dashboard');
      } else {
        throw new Error('Failed to create product');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in mt-8">
      <div className="flex gap-4 items-center">
        <Link href="/dashboard" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>&larr; Back</Link>
        <h2>Add New Product</h2>
      </div>

      <div className="glass-panel mt-8" style={{ padding: '2rem', maxWidth: '800px', marginBottom: '4rem' }}>
        {error && <div style={{ color: 'var(--accent)', background: 'rgba(244, 63, 94, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="input-group">
            <label htmlFor="name">Product Name</label>
            <input id="name" className="input" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>

          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="price">Price (KES)</label>
              <input id="price" className="input" type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="brand">Brand</label>
              <input id="brand" className="input" type="text" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" className="input" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          </div>

          <div className="input-group">
            <label htmlFor="image">Product Image</label>
            <input id="image" className="input" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
          </div>

          <div className="flex items-center gap-2">
            <input id="digital" type="checkbox" checked={form.isDigital} onChange={e => setForm({...form, isDigital: e.target.checked})} />
            <label htmlFor="digital">This is a digital product (e.g. course, ebook)</label>
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
