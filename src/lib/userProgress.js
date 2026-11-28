import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from './supabase.js';

const LEGACY_KEY = 'roadmap-galaxy-progress-v1';
const MIGRATED_KEY = 'roadmap-galaxy-progress-migrated-v1';
const keyFor = (userId) => `${LEGACY_KEY}:${userId}`;
function readKey(key) {
  try { const value = JSON.parse(localStorage.getItem(key) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  catch { return {}; }
}
function notify() { window.dispatchEvent(new Event('roadmap-progress-change')); }

export function useProgress() {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState({});
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    let active = true;
    setReady(false); setSyncError('');
    if (!user) { setStatuses({}); setReady(true); return () => { active = false; }; }
    const load = async () => {
      const scopedKey = keyFor(user.id);
      const local = readKey(scopedKey);
      let legacy = {};
      try {
        if (localStorage.getItem(MIGRATED_KEY) !== 'yes') {
          legacy = readKey(LEGACY_KEY);
        }
      } catch { /* Browser storage can be unavailable. */ }
      const { data, error } = await supabase.from('user_progress').select('topic_id,status').eq('user_id', user.id);
      if (!active) return;
      if (error) {
        setSyncError(`Cloud progress could not be loaded: ${error.message}`);
        const fallback = { ...legacy, ...local };
        setStatuses(fallback); setReady(true); return;
      }
      const remote = Object.fromEntries((data || []).map(row => [row.topic_id, row.status]));
      if (Object.keys(legacy).length || localStorage.getItem(MIGRATED_KEY) !== 'yes') {
        try { localStorage.setItem(MIGRATED_KEY, 'yes'); localStorage.removeItem(LEGACY_KEY); } catch { /* Ignore storage failures. */ }
      }
      const merged = { ...remote, ...legacy, ...local };
      setStatuses(merged); setReady(true);
      try { localStorage.setItem(scopedKey, JSON.stringify(merged)); } catch { /* Ignore unavailable storage. */ }
      const rows = Object.entries(merged).filter(([, status]) => ['not_started','learning','done'].includes(status)).map(([topic_id,status]) => ({ user_id:user.id, topic_id, status, updated_at:new Date().toISOString() }));
      if (rows.length) {
        const { error: saveError } = await supabase.from('user_progress').upsert(rows, { onConflict:'user_id,topic_id' });
        if (saveError && active) setSyncError(`Cloud progress could not be saved: ${saveError.message}`);
      }
    };
    load().catch(error => { if (active) { setSyncError(error.message || 'Unable to load progress.'); setReady(true); } });
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    const refresh = () => { if (user) setStatuses(readKey(keyFor(user.id))); };
    window.addEventListener('storage', refresh);
    window.addEventListener('roadmap-progress-change', refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('roadmap-progress-change', refresh); };
  }, [user?.id]);

  const setStatus = useCallback((topicId, status) => {
    if (!user) return;
    const next = { ...readKey(keyFor(user.id)), [topicId]: status };
    try { localStorage.setItem(keyFor(user.id), JSON.stringify(next)); } catch { /* Keep current session usable. */ }
    setStatuses(next); notify();
    if (supabase) {
      supabase.from('user_progress').upsert({
        user_id: user.id, topic_id: topicId, status, updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,topic_id' }).then(({ error }) => {
        if (error) setSyncError(`Cloud progress could not be saved: ${error.message}`);
      });
    }
  }, [user?.id]);

  const completed = Object.entries(statuses).filter(([, s]) => s === 'done').map(([id]) => id);
  const learning = Object.entries(statuses).filter(([, s]) => s === 'learning').map(([id]) => id);
  return { statuses, completed, learning, setStatus, ready, syncError };
}
