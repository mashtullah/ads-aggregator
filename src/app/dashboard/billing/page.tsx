'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Billing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSimulatePayment = async () => {
    setLoading(true);
    // Conceptually we'd push to IntaSend / M-Pesa STK push.
    setTimeout(() => {
      alert("Payment Success Simulation!");
      router.push('/dashboard');
      // A genuine backend route would update 'isSubscribed = true'
    }, 2000);
  };

  return (
    <div className="container animate-fade-in mt-8 mb-8" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <h2>Upgrade to Oskido Pro</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>KES 1,500 / month</p>

        <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <li>✅ Unrestricted Product Limits</li>
          <li>✅ AI Video Ads & Text Generation</li>
          <li>✅ Direct Meta Deployments</li>
          <li>✅ IntaSend Commerce Escrow</li>
        </ul>

        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading} onClick={handleSimulatePayment}>
          {loading ? 'Processing with IntaSend...' : 'Pay via M-Pesa / Card'}
        </button>
      </div>
      <Link href="/dashboard" className="mt-8" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>&larr; Back to Dashboard</Link>
    </div>
  );
}
