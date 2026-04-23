'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdGenerator() {
  const params = useParams();
  const productId = params?.id as string;
  
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [ad, setAd] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [instructions, setInstructions] = useState('');
  
  const [targeting, setTargeting] = useState<any>(null);
  const [targetLoading, setTargetLoading] = useState(false);
  const [deployed, setDeployed] = useState<any>(null);

  useEffect(() => {
    if (productId) {
      fetch(`/api/products/details?id=${productId}`)
        .then(res => res.json())
        .then(data => {
            setProduct(data.product);
            setHistory(data.product.ads || []);
            if (data.product.ads?.length > 0) {
                setAd(data.product.ads[0]);
            }
        });
    }
  }, [productId]);

  const handleGenerate = async () => {
    setLoading(true);
    setDeployed(null);
    setTargeting(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            productId, 
            instructions,
            history: history.map(h => h.script).slice(0, 3) // Give last 3 as context
        })
      });
      const data = await res.json();
      if (data.success) {
        setAd(data.ad);
        setHistory([data.ad, ...history]);
        setInstructions('');
      } else alert(data.message);
    } catch (err) {
      console.error(err);
      alert('Failed to generate ad');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTargeting = async () => {
    if (!ad) return;
    setTargetLoading(true);
    try {
      const res = await fetch('/api/meta/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id })
      });
      const data = await res.json();
      if (data.success) {
        setTargeting(data.targeting);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTargetLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!ad) return;
    setTargetLoading(true);
    try {
       const res = await fetch('/api/meta/deploy', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ adId: ad.id, targeting })
       });
       const data = await res.json();
       if (data.success) setDeployed(data.campaign);
    } catch (err) {} finally { setTargetLoading(false); }
  };

  return (
    <div className="container animate-fade-in mt-8 mb-8">
      <div className="flex gap-4 items-center mb-8">
        <Link href="/dashboard" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>&larr; Back</Link>
        <h2>AI Advertisement Wizard</h2>
      </div>

      <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
        
        {/* Left Column: Generator Controls */}
        <div style={{ flex: '2 1 500px' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3>Prompt AI & Refine</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
               Give specific feedback to the AI (e.g. "Add a deep male voiceover", "Mention 50% discount", "Make the font bigger").
            </p>
            
            <textarea 
              className="input mb-4" 
              rows={4} 
              placeholder="Type your refinement instructions here..." 
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            
            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Consulting Global AI...' : ad ? 'Apply Changes / Regenerate' : 'Generate Global Ad'}
            </button>

            {ad && (
               <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                 <h3>Global Targeting Suggester</h3>
                 <button className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleSuggestTargeting} disabled={targetLoading}>
                   {targetLoading ? 'Synthesizing...' : '🔮 Get Global Audience Insights'}
                 </button>
                 
                 {targeting && (
                    <div className="mt-4 p-4 animate-fade-in" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                       <p><strong>Recommended Geographies:</strong> Global Focus (Multi-region)</p>
                       <p><strong>Ages:</strong> {targeting.ageRange}</p>
                       <p><strong>Interests:</strong> {targeting.interests?.join(', ')}</p>
                       <button className="btn btn-secondary mt-4" style={{ width: '100%' }} onClick={handleDeploy}>Deploy to Meta Ads</button>
                    </div>
                 )}

                 {deployed && (
                    <div className="mt-4 p-4" style={{ background: 'var(--primary)', color: 'black', borderRadius: '8px' }}>
                       <strong>✅ Ad Activated Globally!</strong>
                       <p style={{ fontSize: '0.8rem' }}>Meta ID: {deployed.metaAdId}</p>
                    </div>
                 )}
               </div>
            )}
          </div>

          <div className="glass-panel mt-8" style={{ padding: '2rem' }}>
             <h3>Ad Version History</h3>
             <div className="flex flex-col gap-3 mt-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {history.map((h, i) => (
                   <div key={h.id} className="p-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', cursor: 'pointer', border: ad?.id === h.id ? '1px solid var(--primary)' : '1px solid transparent' }} onClick={() => setAd(h)}>
                      <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Version {history.length - i} - {new Date(h.createdAt).toLocaleDateString()}</p>
                      <p style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.script}</p>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Preview Panel with CSS Overlay */}
        <div style={{ flex: '1 1 400px' }}>
           <div className="glass-panel" style={{ padding: '2rem', height: '100%', position: 'sticky', top: '2rem' }}>
              <h3>Creative Preview</h3>
              
              {!ad && !loading && (
                 <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>Waiting for generation...</p>
                 </div>
              )}

              {loading && (
                 <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                    <p className="animate-pulse" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                       ✨ AI is splicing image, text, and generating human-like voiceover...
                    </p>
                 </div>
              )}

              {ad && !loading && (
                 <div className="animate-fade-in mt-4">
                    {/* HTML/CSS Text Overlay System */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                        {product?.imageUrl ? (
                           <img src={product.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} alt="Ad Base" />
                        ) : (
                           <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                              <span style={{ color: '#333' }}>No Product Image</span>
                           </div>
                        )}
                        
                        {/* THE OVERLAY */}
                        <div style={{ position: 'absolute', bottom: '10%', left: '5%', right: '5%', textAlign: 'center', zIndex: 10 }}>
                           <p style={{ 
                              background: 'rgba(0,0,0,0.8)', 
                              color: 'white', 
                              padding: '1rem', 
                              borderRadius: '8px', 
                              fontSize: '1.1rem', 
                              fontWeight: 'bold', 
                              lineHeight: '1.4',
                              borderTop: '2px solid var(--primary)'
                           }}>
                              {ad.script.split('AI SUGGESTION')[0].substring(0, 120)}...
                           </p>
                        </div>

                        <div style={{ position: 'absolute', top: '5%', right: '5%', background: 'var(--primary)', color: 'black', padding: '0.3rem 0.8rem', borderRadius: '4px', fontWeight: 'bold' }}>
                           KES {product?.price}
                        </div>
                    </div>

                    <div className="mt-6">
                       <h4 style={{ color: 'var(--secondary)' }}>Marketing Script</h4>
                       <p style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: '0.5rem 0' }}>"{ad.script.split('AI SUGGESTION')[0]}"</p>
                       
                       {ad.script.includes('AI SUGGESTION') && (
                          <div className="mt-4 p-3" style={{ background: 'rgba(57, 255, 20, 0.1)', borderLeft: '3px solid var(--primary)', borderRadius: '4px' }}>
                             <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>AI BUSINESS SUGGESTION:</p>
                             <p style={{ fontSize: '0.8rem' }}>{ad.script.split('AI SUGGESTION:')[1]}</p>
                          </div>
                       )}
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
