import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    let authEventReceived = false;

    // Subscribe before reading the stored session. This prevents a late
    // getSession() response from overwriting a newer SIGNED_IN event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        authEventReceived = true;
        if (active) {
          setSession(nextSession);
          setLoading(false);
        }
      },
    );

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active || authEventReceived) return;
        if (error) console.error('Unable to restore session:', error.message);
        setSession(data?.session ?? null);
        setLoading(false);
      })
      .catch((error) => {
        if (!active || authEventReceived) return;
        console.error('Unable to restore session:', error);
        setSession(null);
        setLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    configured: supabaseConfigured,
    // Apply the session returned directly by sign-in/sign-up immediately;
    // the auth-state listener will keep it synchronized afterward.
    acceptSession: (nextSession) => setSession(nextSession),
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
