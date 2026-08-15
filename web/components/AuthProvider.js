'use client';
// Shares the signed-in Supabase user across the app (header, dashboard, admin).
import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/db';

const AuthCtx = createContext({ user: null, ready: false, signOut: async () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Subscribe to auth state; onChange fires immediately with the current user.
    const unsub = db.auth.onChange((u) => { setUser(u); setReady(true); });
    return unsub;
  }, []);

  const signOut = async () => { await db.auth.signOut(); setUser(null); };

  return <AuthCtx.Provider value={{ user, ready, signOut }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

// Display name: chosen username, else the email prefix.
export function displayName(user) {
  if (!user) return 'Member';
  const meta = user.user_metadata || {};
  return meta.username || (user.email || 'Member').split('@')[0];
}
