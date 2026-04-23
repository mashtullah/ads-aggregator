'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/' })} 
      className="btn btn-outline"
      style={{ color: '#ff4d4f', borderColor: '#ff4d4f' }}
    >
      Sign Out
    </button>
  );
}
