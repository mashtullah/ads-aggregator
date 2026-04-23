'use client'; 

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error natively to the browser console for debugging
    console.error('Dashboard Server Error:', error);
  }, [error]);

  return (
    <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
         <h2 style={{ color: '#ff4d4f' }}>Runtime Server Exception</h2>
         
         <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', marginTop: '1.5rem', textAlign: 'left', fontFamily: 'monospace', color: '#ff7875', overflowX: 'auto' }}>
            <p style={{ fontWeight: 'bold' }}>Reason: {error.message}</p>
         </div>
         
         <div style={{ marginTop: '2rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <p><strong>Troubleshooting strict Vercel Deployments:</strong></p>
            <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <li>1. Did your Vercel deployment lose database connection? Ensure <code>DATABASE_URL</code> is perfectly pasted inside Vercel's Environment Variables setting.</li>
               <li>2. Are your NextAuth variables missing? In production, you absolutely must define <code>NEXTAUTH_SECRET</code> and <code>NEXTAUTH_URL</code> (e.g. <code>https://your-app.vercel.app</code>) in the Vercel Settings or authentication crashes the dashboard routing!</li>
            </ul>
         </div>

         <button
            onClick={() => reset()}
            className="btn btn-outline mt-8"
         >
            Attempt Reload
         </button>
      </div>
    </div>
  );
}
