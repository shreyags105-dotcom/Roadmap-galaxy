import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequireAuth({ children }) {
  const { user, loading, configured } = useAuth();
  const location = useLocation();
  if (!configured) return <main className="min-h-screen grid place-items-center p-5"><section className="glass max-w-xl"><h1 className="!text-2xl">Connect Supabase</h1><p className="muted">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file, then restart the development server.</p><p className="muted text-sm">Use the public anon/publishable key only. Never expose a service-role secret.</p></section></main>;
  if (loading) return <main className="min-h-screen grid place-items-center"><p className="muted">Opening your galaxy…</p></main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
