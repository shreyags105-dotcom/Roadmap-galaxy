import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import { Login, Signup, ForgotPassword, ResetPassword } from './pages/AuthPages.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { RoadmapLibrary, RoadmapDetail } from './pages/Roadmaps.jsx';
import { IdeaLab, IdeaDetail } from './pages/Ideas.jsx';
import Plans from './pages/Plans.jsx';
import CareerCompass from './pages/CareerCompass.jsx';
import FocusMode from './pages/FocusMode.jsx';
import MemoryProbe from './pages/MemoryProbe.jsx';

function ProtectedLayout() {
  return <RequireAuth><Layout /></RequireAuth>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="roadmaps" element={<RoadmapLibrary />} />
        <Route path="roadmaps/:roadmapId" element={<RoadmapDetail />} />
        <Route path="hackathon-ideas" element={<IdeaLab />} />
        <Route path="hackathon-ideas/:ideaId" element={<IdeaDetail />} />
        <Route path="plans" element={<Plans />} />
        <Route path="compass" element={<CareerCompass />} />
        <Route path="focus" element={<FocusMode />} />
        <Route path="memory" element={<MemoryProbe />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function NotFound() {
  return <div className="glass"><h2 className="mt-0">Page not found</h2><p className="muted">That route does not exist.</p></div>;
}
