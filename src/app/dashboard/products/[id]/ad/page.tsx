'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdGenerator() {
  const params = useParams();
  const productId = params?.id as string;
  
  const [loading, setLoading] = useState(false);
  const [ad, setAd] = useState<any>(null);
  const [instructions, setInstructions] = useState('');
  
  const [targeting, setTargeting] = useState<any>(null);
  const [targetLoading, setTargetLoading] = useState(false);
  
  const [deployed, setDeployed] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setDeployed(null);
    setTargeting(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, instructions })
      });
      const data = await res.json();
      if (data.success) {
        setAd(data.ad);
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

  const handleDeployToMeta = async () => {
    setTargetLoading(true);
    try {
      const res = await fetch('/api/meta/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id, targeting })
      });
      const data = await res.json();
      if (data.success) {
        setDeployed(data.campaign);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTargetLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in mt-8 mb-8">
      <div className="flex gap-4 items-center mb-8">
        <Link href="/dashboard" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>&larr; Back</Link>
        <h2>AI Advertisement Wizard</h2>
      </div>

      <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
        
        {/* Left Column: Generator Controls */}
        <div style={{ flex: '1 1 400px' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3>Prompt AI</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              We'll automatically read your product description, but you can feed the AI secondary commands below (e.g., "Make it funny" or "Target 18-24 demographics").
            </p>
            
            <textarea 
              className="input mb-4" 
              rows={4} 
              placeholder="Refining instructions..." 
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
            
            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Consulting AI Lab...' : ad ? 'Regenerate Ad' : 'Generate Ad'}
            </button>
            
            {ad && !deployed && (
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                 <h3>Distribution</h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Get AI audience suggestions before executing budget.</p>
                 <button className="btn btn-outline w-full" style={{ width: '100%' }} disabled={targetLoading} onClick={handleSuggestTargeting}>
                    {targetLoading ? 'Calculating...' : '🔮 Suggest Meta Targeting'}
                 </button>
                 
                 {targeting && (
                   <div className="mt-4 p-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                     <p><strong>Ages:</strong> {targeting.ageRange}</p>
                     <p><strong>Locations:</strong> {targeting.locations?.join(', ')}</p>
                     <p><strong>Interests:</strong> {targeting.interests?.join(', ')}</p>
                     
                     <button className="btn btn-secondary mt-4 w-full" style={{ width: '100%', marginTop: '1rem' }} onClick={handleDeployToMeta}>
                       Deploy Live to Facebook/Ig!
                     </button>
                   </div>
                 )}
              </div>
            )}
            
            {deployed && (
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                 <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✅ Campaign Active on Meta!</p>
                 <p style={{ fontSize: '0.85rem' }}>Campaign ID: {deployed.metaCampaignId}</p>
                 <p style={{ fontSize: '0.85rem' }}>Ad Set ID: {deployed.metaAdSetId}</p>
                 <p style={{ fontSize: '0.85rem' }}>Ad ID: {deployed.metaAdId}</p>
                 <Link href="/dashboard" className="btn btn-outline mt-4" style={{ width: '100%' }}>Return to Dashboard</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview Panel */}
        <div style={{ flex: '1 1 500px' }}>
           <div className="glass-panel" style={{ padding: '2rem', height: '100%' }}>
              <h3>Output Preview</h3>
              
              {!ad && !loading && (
                 <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>No ad generated yet.</p>
                 </div>
              )}

              {loading && (
                 <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                    <p className="animate-fade-in" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                       ✨ AI is crafting text, splicing image, and rendering TTS voice...
                    </p>
                 </div>
              )}

              {ad && !loading && (
                 <div className="animate-fade-in mt-4">
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                       <h4 style={{ color: 'var(--secondary)' }}>Generated Script (Meta Text)</h4>
                       <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>"{ad.script}"</p>
                    </div>

                    <div className="flex flex-col gap-2">
                       <h4>Generated Video / Audio Package</h4>
                       <div style={{ background: '#000', width: '100%', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                          <span style={{ color: '#fff', fontSize: '0.9rem', opacity: 0.7 }}>[Spliced MP4 Video Mock Preview]</span>
                       </div>
                       
                       <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                         * Sandbox Note: Final file dynamically assembled at {ad.videoUrl}.
                       </p>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
