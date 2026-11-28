import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

function AuthShell({ title, subtitle, children }) {
  const { configured } = useAuth();
  return <main className="min-h-screen grid place-items-center px-4 py-10"><div className="w-full max-w-md"><Link to="/login" className="block text-center font-heading text-ice text-xl mb-6">🚀 Roadmap Galaxy</Link><section className="glass"><span className="kicker">YOUR LEARNING UNIVERSE</span><h1 className="!text-3xl mt-2">{title}</h1><p className="muted mb-5">{subtitle}</p>{configured ? children : <p role="alert" className="text-sm text-red-300">Supabase is not configured. Add your project URL and public key to .env.local, then restart the development server.</p>}</section></div></main>;
}
function Message({ children, error }) { return children ? <p role="status" className={`mt-4 text-sm ${error ? 'text-red-300' : 'text-ice'}`}>{children}</p> : null; }

export function Login() {
  const { user, configured } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(''); const [error,setError]=useState(false);
  if (user) return <Navigate to="/" replace />;
  async function submit(e){e.preventDefault();setBusy(true);setMessage('');setError(false);const {error:err}=await supabase.auth.signInWithPassword({email:email.trim(),password});setBusy(false);if(err){setError(true);setMessage(err.message);return;}navigate(location.state?.from?.pathname||'/',{replace:true});}
  return <AuthShell title="Welcome back" subtitle="Log in to continue your learning journey."><form onSubmit={submit} className="grid gap-3"><label className="text-sm">Email<input className="field mt-1" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="text-sm">Password<input className="field mt-1" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn btn-primary mt-2" disabled={busy}>{busy?'Logging in…':'Log in'}</button></form><Message error={error}>{message}</Message><div className="flex justify-between gap-3 text-sm mt-5"><Link to="/forgot-password">Forgot password?</Link><Link to="/signup">Create account</Link></div></AuthShell>;
}

export function Signup() {
 const {user}=useAuth();const navigate=useNavigate();const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState(false);
 if(user)return <Navigate to="/" replace/>;
 async function submit(e){e.preventDefault();setBusy(true);setMessage('');setError(false);const {data,error:err}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:`${window.location.origin}/login`}});setBusy(false);if(err){setError(true);setMessage(err.message);return;}if(data.session)navigate('/',{replace:true});else setMessage('Account created! Check your email for the confirmation link, then log in.');}
 return <AuthShell title="Create your account" subtitle="Save your roadmaps and progress to your own account."><form onSubmit={submit} className="grid gap-3"><label className="text-sm">Email<input className="field mt-1" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="text-sm">Password<input className="field mt-1" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/><small className="muted">Use at least 8 characters.</small></label><button className="btn btn-primary mt-2" disabled={busy}>{busy?'Creating account…':'Sign up'}</button></form><Message error={error}>{message}</Message><p className="text-sm mt-5 muted">Already registered? <Link to="/login">Log in</Link></p></AuthShell>;
}

export function ForgotPassword() {
 const [email,setEmail]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState(false);
 async function submit(e){e.preventDefault();setBusy(true);setMessage('');setError(false);const {error:err}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/reset-password`});setBusy(false);if(err){setError(true);setMessage(err.message);}else setMessage('If an account exists for that email, a password reset link has been sent.');}
 return <AuthShell title="Reset your password" subtitle="We'll email you a secure password reset link."><form onSubmit={submit} className="grid gap-3"><label className="text-sm">Email<input className="field mt-1" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><button className="btn btn-primary" disabled={busy}>{busy?'Sending…':'Send reset link'}</button></form><Message error={error}>{message}</Message><p className="text-sm mt-5"><Link to="/login">Back to login</Link></p></AuthShell>;
}

export function ResetPassword() {
 const [password,setPassword]=useState('');const [message,setMessage]=useState('');const [error,setError]=useState(false);const [busy,setBusy]=useState(false);
 async function submit(e){e.preventDefault();setBusy(true);setMessage('');setError(false);const {error:err}=await supabase.auth.updateUser({password});setBusy(false);if(err){setError(true);setMessage(err.message);}else setMessage('Password updated. You can now log in with your new password.');}
 return <AuthShell title="Choose a new password" subtitle="Set a new password for your Roadmap Galaxy account."><form onSubmit={submit} className="grid gap-3"><label className="text-sm">New password<input className="field mt-1" type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn btn-primary" disabled={busy}>{busy?'Updating…':'Update password'}</button></form><Message error={error}>{message}</Message><p className="text-sm mt-5"><Link to="/login">Back to login</Link></p></AuthShell>;
}
