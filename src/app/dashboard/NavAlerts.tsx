'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NavAlerts() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/notifications/unread');
        const data = await res.json();
        setUnread(data.count);
      } catch (err) {}
    };

    check();
    const timer = setInterval(check, 10000); // Check every 10 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-3">
      <Link href="/dashboard/inbox" className="btn btn-outline" style={{ position: 'relative', padding: '0.5rem 1rem', textDecoration: 'none' }}>
         Inbox
      </Link>
      <Link href="/dashboard/notifications" className="btn btn-outline" style={{ position: 'relative', padding: '0.5rem 1rem', textDecoration: 'none' }}>
         Activity
         {unread > 0 && (
           <span style={{ 
             position: 'absolute', 
             top: '-5px', 
             right: '-5px', 
             background: 'var(--accent)', 
             color: 'black', 
             borderRadius: '50%', 
             width: '20px', 
             height: '20px', 
             fontSize: '0.7rem', 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center',
             fontWeight: 'bold'
           }}>
             {unread}
           </span>
         )}
      </Link>
    </div>
  );
}
