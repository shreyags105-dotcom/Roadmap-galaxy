import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); return undefined; }
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (active) {
        if (error) console.error('Unable to restore session:', error.message);
        setSession(data?.session ?? null);
        setLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    configured: supabaseConfigured,
    signOut: async () => {
      if (!supabase) return { error: new Error('Supabase is not configured.') };
      return supabase.auth.signOut();
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
