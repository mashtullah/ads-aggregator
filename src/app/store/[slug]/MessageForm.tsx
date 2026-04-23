'use client';

import { useState } from 'react';

export default function MessageForm({ storeId, isAuthenticated }: { storeId: string, isAuthenticated: boolean }) {
  const [show, setShow] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, content })
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setContent('');
        setTimeout(() => {
          setSent(false);
          setShow(false);
        }, 3000);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
       <a href="/login" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', textDecoration: 'none' }}>
          Message Seller
       </a>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setShow(!show)} 
        className="btn btn-primary" 
        style={{ borderRadius: 'var(--radius-full)' }}
      >
        Message Seller
      </button>

      {show && (
        <div 
          className="glass-panel animate-fade-in" 
          style={{ 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            marginTop: '1rem', 
            width: '300px', 
            zIndex: 100, 
            padding: '1.5rem',
            textAlign: 'left'
          }}
        >
          {sent ? (
            <p style={{ color: 'var(--primary)', textAlign: 'center' }}>Message sent successfully!</p>
          ) : (
            <>
              <h4>Chat with Seller</h4>
              <textarea 
                className="input mt-4" 
                rows={4} 
                style={{ width: '100%', marginBottom: '1rem' }}
                placeholder="Ask about availability, delivery..."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                disabled={loading}
                onClick={handleSend}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
