'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProduct() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    brand: '',
    description: '',
    imageUrl: '',
    isDigital: false
  });

  useEffect(() => {
    fetch(`/api/products/details?id=${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setFormData({
            name: data.product.name,
            price: data.product.price.toString(),
            brand: data.product.brand || '',
            description: data.product.description || '',
            imageUrl: data.product.imageUrl || '',
            isDigital: data.product.isDigital
          });
        }
      });
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/products/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, ...formData })
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        await fetch(`/api/products/update?id=${productId}`, { method: 'DELETE' });
        router.push('/dashboard');
    } catch (err) {}
  };

  return (
    <div className="container animate-fade-in mt-8 mb-8" style={{ maxWidth: '600px' }}>
      <div className="flex gap-4 items-center mb-8">
        <Link href="/dashboard" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>&larr; Back</Link>
        <h2>Edit Product</h2>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        <div className="mb-4">
          <label className="label">Product Name</label>
          <input 
            type="text" 
            className="input" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="flex gap-4 mb-4">
          <div style={{ flex: 1 }}>
            <label className="label">Price (KES)</label>
            <input 
              type="number" 
              className="input" 
              required 
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label">Brand</label>
            <input 
              type="text" 
              className="input" 
              value={formData.brand}
              onChange={e => setFormData({...formData, brand: e.target.value})}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="label">Description</label>
          <textarea 
            className="input" 
            rows={4} 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="mb-8">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              checked={formData.isDigital}
              onChange={e => setFormData({...formData, isDigital: e.target.checked})}
            />
            Digital / Service Product
          </label>
        </div>

        <button type="submit" className="btn btn-primary w-full" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Updating...' : 'Save Changes'}
        </button>

        <button type="button" onClick={handleDelete} className="btn-outline w-full mt-4" style={{ width: '100%', color: '#ff4d4f', borderColor: '#ff4d4f', padding: '0.8rem', borderRadius: '8px' }}>
           Delete Product
        </button>
      </form>
    </div>
  );
}
