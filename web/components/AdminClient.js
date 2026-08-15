'use client';
// Owner-only Advisor Desk. RLS is the real lock (only the owner account can
// SELECT inquiries); this email allowlist is UX only. Ported from admin.js.
import { useCallback, useEffect, useState } from 'react';
import { db } from '@/lib/db';

// Keep in sync with the RLS policies in backend/schema.sql.
const OWNERS = ['hhabibhashmi5@gmail.com', 'absarajammalik1@gmail.com'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isOwner = (user) => !!(user && user.email && OWNERS.includes(user.email.toLowerCase()));

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch { return String(iso); }
};

export default function AdminClient() {
  const [view, setView] = useState('gate'); // 'gate' | 'panel'
  const [who, setWho] = useState('');
  const [rows, setRows] = useState([]);
  const [subs, setSubs] = useState('—');
  const [filter, setFilter] = useState('all');
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    const client = db.raw();
    if (!client) return;
    const res = await client.from('inquiries').select('*').order('created_at', { ascending: false });
    setRows(res.error ? [] : res.data || []);
    const scount = await client.from('subscribers').select('id', { count: 'exact', head: true });
    setSubs(scount.count != null ? scount.count : (scount.data && scount.data.length) || 0);
  }, []);

  const enterPanel = useCallback(async (user) => { setWho(`Signed in as ${user.email}`); setView('panel'); await loadData(); }, [loadData]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!db.isReady()) { setView('gate'); setNote({ msg: 'Supabase isn’t connected yet — add your keys in lib/config.js.', state: 'error' }); return; }
      try {
        const user = await db.auth.current();
        if (cancelled) return;
        if (isOwner(user)) enterPanel(user);
        else if (user) { await db.auth.signOut(); setView('gate'); }
        else setView('gate');
      } catch { if (!cancelled) setView('gate'); }
    })();
    return () => { cancelled = true; };
  }, [enterPanel]);

  const onSignIn = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = (f.get('email') || '').trim();
    const pw = f.get('password') || '';
    if (!EMAIL_RE.test(email)) { setNote({ msg: 'Enter a valid email.', state: 'error' }); return; }
    if (pw.length < 6) { setNote({ msg: 'Password must be at least 6 characters.', state: 'error' }); return; }
    if (!db.isReady()) { setNote({ msg: 'Supabase isn’t connected (check lib/config.js).', state: 'error' }); return; }

    setBusy(true); setNote(null);
    try {
      const res = await db.auth.signIn(email, pw);
      setBusy(false);
      if (res.ok && res.user) {
        if (isOwner(res.user)) { setNote({ msg: 'Welcome.', state: 'success' }); enterPanel(res.user); }
        else { await db.auth.signOut(); setNote({ msg: "That account isn't authorized for the desk.", state: 'error' }); }
      } else if (res.needsConfirm) setNote({ msg: 'Confirm your email first, or create the user with Auto-Confirm in Supabase.', state: 'error' });
      else if (res.offline) setNote({ msg: 'Supabase isn’t connected (check lib/config.js).', state: 'error' });
      else setNote({ msg: (res.error && res.error.message) || 'Sign-in failed. Check your details.', state: 'error' });
    } catch (err) {
      setBusy(false); console.error('[Sojourn] desk sign-in error:', err);
      setNote({ msg: 'Sign-in failed. Please try again.', state: 'error' });
    }
  };

  const signOut = async () => { await db.auth.signOut(); setRows([]); setView('gate'); setNote(null); };

  const list = filter === 'all' ? rows : rows.filter((r) => r.type === filter);
  const count = (t) => rows.filter((r) => r.type === t).length;

  if (view === 'gate') {
    return (
      <section className="gate">
        <p className="overline">Private</p>
        <h1>Advisor Desk</h1>
        <p className="gate__sub">Sign in with your owner account to view inquiries.</p>
        <form noValidate onSubmit={onSignIn}>
          <div className="field"><label htmlFor="gateEmail">Email</label><input id="gateEmail" name="email" type="email" autoComplete="email" required /></div>
          <div className="field"><label htmlFor="gatePassword">Password</label><input id="gatePassword" name="password" type="password" autoComplete="current-password" minLength="6" required /></div>
          <button className="btn btn--solid gate__submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Sign In'}</button>
          <p className={`gate__note${note?.state === 'error' ? ' is-error' : ''}${note?.state === 'success' ? ' is-success' : ''}`} role="status">{note?.msg || ''}</p>
        </form>
      </section>
    );
  }

  return (
    <section className="desk container">
      <div className="desk__bar">
        <div><h1>Inquiries</h1><p className="desk__who">{who}</p></div>
        <div className="desk__actions">
          <button className="btn btn--ghost-dark btn--sm" type="button" onClick={loadData}>Refresh</button>
          <button className="btn btn--ghost-dark btn--sm" type="button" onClick={signOut}>Sign Out</button>
        </div>
      </div>

      <div className="stat-row">
        <div className="desk-stat"><div className="desk-stat__n">{rows.length}</div><div className="desk-stat__k">Total inquiries</div></div>
        <div className="desk-stat"><div className="desk-stat__n">{count('booking')}</div><div className="desk-stat__k">Booking requests</div></div>
        <div className="desk-stat"><div className="desk-stat__n">{count('advisory')}</div><div className="desk-stat__k">Advisory requests</div></div>
        <div className="desk-stat"><div className="desk-stat__n">{subs}</div><div className="desk-stat__k">Subscribers</div></div>
      </div>

      <div className="tabs" role="tablist">
        {['all', 'booking', 'advisory'].map((t) => (
          <button key={t} className={`tab${filter === t ? ' is-active' : ''}`} type="button" onClick={() => setFilter(t)}>{t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="desk-table">
          <thead>
            <tr><th>Type</th><th>Name</th><th>Email</th><th>Destination</th><th>Dates</th><th>Party</th><th>Notes</th><th>Received</th></tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const type = r.type === 'booking' ? 'booking' : 'advisory';
              return (
                <tr key={r.id}>
                  <td><span className={`pill pill--${type}`}>{type}</span></td>
                  <td>{r.name || '—'}</td>
                  <td className="cell-mail"><a href={`mailto:${r.email || ''}`}>{r.email || '—'}</a></td>
                  <td>{r.destination || '—'}</td>
                  <td>{r.travel_dates || '—'}</td>
                  <td>{r.party_size != null ? r.party_size : '—'}</td>
                  <td className="cell-msg">{r.message || '—'}</td>
                  <td className="cell-when">{fmtDate(r.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <div className="desk-empty">No inquiries yet.</div>}
      </div>
      <p className="desk-hint">Read-only. Inquiries are protected by row-level security — only your owner account can see this.</p>
    </section>
  );
}
