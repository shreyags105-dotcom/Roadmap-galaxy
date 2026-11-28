import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Starfield from './Starfield.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/roadmaps', label: 'Roadmap Library' },
  { to: '/hackathon-ideas', label: 'Hackathon Idea Lab' },
  { to: '/plans', label: 'My Plans' },
  { to: '/compass', label: 'Career Compass' },
  { to: '/focus', label: 'Focus Mode' },
  { to: '/memory', label: 'Memory Probe' },
];

export default function Layout() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = React.useState(false);
  return (
    <>
      <Starfield />
      <header className="sticky top-0 z-10 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap border-b border-ice/20 bg-void/70 px-3 py-2 backdrop-blur-md md:px-6" style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}>
        <b className="mr-3 flex-none font-heading text-ice"><span aria-hidden="true">🚀 </span>Roadmap Galaxy</b>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `flex-none rounded-lg px-3 py-1.5 font-medium no-underline transition ${isActive ? 'btn-primary text-starlight shadow-glow' : 'text-starlight/70 hover:bg-electric/15 hover:text-starlight'}`}>
            {l.label}
          </NavLink>
        ))}
        <div className="ml-auto flex flex-none items-center gap-2 pl-3">
          <span className="hidden max-w-[180px] truncate text-xs text-ice/70 lg:inline" title={user?.email}>{user?.email}</span>
          <button className="btn" disabled={signingOut} onClick={async () => { setSigningOut(true); const { error } = await signOut(); if (error) console.error(error.message); setSigningOut(false); }}>{signingOut ? 'Signing out…' : 'Log out'}</button>
        </div>
      </header>
      <main key={pathname} className="relative z-[1] mx-auto max-w-[1240px] animate-enter px-4 pb-24 pt-8 md:px-6">
        <Outlet />
      </main>
    </>
  );
}
