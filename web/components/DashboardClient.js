'use client';
// Auth-gated member dashboard: profile, own requests, saved-trips wishlist.
// RLS ensures members only ever read/write their own rows. Ported from dashboard.js.
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, displayName } from './AuthProvider';
import { useModal } from './ModalProvider';
import { db } from '@/lib/db';
import { destinations } from '@/lib/data';

const fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return String(iso); }
};

export default function DashboardClient() {
  const { user, ready, signOut } = useAuth();
  const { openModal } = useModal();
  const [requests, setRequests] = useState(null);
  const [trips, setTrips] = useState(null);
  const [pick, setPick] = useState('');
  const [note, setNote] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadRequests = useCallback(() => { db.myInquiries().then((res) => setRequests(res.data || [])); }, []);
  const loadTrips = useCallback(() => { db.trips.list().then((res) => setTrips(res.data || [])); }, []);

  useEffect(() => {
    if (user) { loadRequests(); loadTrips(); }
    else { setRequests(null); setTrips(null); }
  }, [user, loadRequests, loadTrips]);

  const addTrip = async () => {
    if (!pick) { setNote({ msg: 'Pick a destination first.', state: 'error' }); return; }
    setSaving(true); setNote({ msg: 'Saving…' });
    const res = await db.trips.save(pick);
    setSaving(false);
    if (res.ok) { setNote({ msg: `${pick} saved.`, state: 'success' }); setPick(''); loadTrips(); }
    else setNote({ msg: (res.error && res.error.message) || "Couldn't save. Try again.", state: 'error' });
  };

  const removeTrip = async (id) => {
    const res = await db.trips.remove(id);
    if (res.ok) loadTrips();
    else setNote({ msg: "Couldn't remove. Try again.", state: 'error' });
  };

  // Signed-out
  if (!user) {
    return (
      <section className="section">
        <div className="container signin-prompt">
          <div className="card">
            <p className="overline">Members only</p>
            <h2 className="card__title" style={{ fontSize: '1.7rem' }}>Sign in to continue</h2>
            <p style={{ color: 'var(--taupe)', marginBottom: '1.5rem' }}>
              {ready && !db.isReady() ? 'Member accounts activate once Supabase is connected.' : "Access your saved trips and the requests you've sent our advisors."}
            </p>
            <button className="btn btn--solid" type="button" onClick={() => openModal('auth')}>Sign In or Join</button>
          </div>
        </div>
      </section>
    );
  }

  const meta = user.user_metadata || {};

  return (
    <section className="dash container">
      <div className="dash__grid">
        <aside>
          <div className="card">
            <h2 className="card__title"><small>Profile</small><span>{displayName(user)}</span></h2>
            <div className="profile__row"><span className="profile__k">Username</span><span className="profile__v">{meta.username || '—'}</span></div>
            <div className="profile__row"><span className="profile__k">Email</span><span className="profile__v">{user.email || '—'}</span></div>
            <div className="profile__row"><span className="profile__k">Member since</span><span className="profile__v">{fmtDate(user.created_at)}</span></div>
            <div className="profile__row"><span className="profile__k">Requests</span><span className="profile__v">{requests == null ? '—' : requests.length}</span></div>
            <div className="profile__row"><span className="profile__k">Saved trips</span><span className="profile__v">{trips == null ? '—' : trips.length}</span></div>
            <button className="btn btn--ghost-dark btn--sm" type="button" style={{ width: '100%', marginTop: '1.25rem' }} onClick={signOut}>Sign Out</button>
          </div>
        </aside>

        <div>
          <div className="card">
            <h2 className="card__title"><small>Your requests</small>Sent to our advisors</h2>
            <div>
              {requests == null ? <p className="dash-empty">Loading…</p>
                : requests.length === 0 ? <p className="dash-empty">No requests yet. <Link className="link-inline" href="/booking">Plan your first journey →</Link></p>
                : requests.map((r) => {
                  const type = r.type === 'booking' ? 'booking' : 'advisory';
                  const bits = [];
                  if (r.travel_dates) bits.push(r.travel_dates);
                  if (r.party_size != null) bits.push(`${r.party_size} travelling`);
                  return (
                    <div className="req" key={r.id}>
                      <div className="req__head">
                        <span className="req__dest">{r.destination || 'To be decided'}</span>
                        <span className="req__when"><span className={`pill pill--${type}`}>{type}</span> &nbsp;{fmtDate(r.created_at)}</span>
                      </div>
                      {bits.length > 0 && <p className="req__meta">{bits.join(' · ')}</p>}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="card">
            <h2 className="card__title"><small>Saved trips</small>Your wishlist</h2>
            <div>
              {trips == null ? <p className="dash-empty">Loading…</p>
                : trips.length === 0 ? <p className="dash-empty">No saved trips yet. Add one below.</p>
                : (
                  <div className="trip-grid">
                    {trips.map((t) => (
                      <div className="trip" key={t.id}>
                        <button className="trip__remove" type="button" aria-label={`Remove ${t.destination}`} onClick={() => removeTrip(t.id)}>&times;</button>
                        <div className="trip__dest">{t.destination}</div>
                        {t.note && <p className="trip__note">{t.note}</p>}
                      </div>
                    ))}
                  </div>
                )}
            </div>
            <div className="add-trip">
              <select aria-label="Destination to save" value={pick} onChange={(e) => setPick(e.target.value)}>
                <option value="">Add a destination…</option>
                {destinations.map((d) => <option key={d.slug}>{d.name}</option>)}
              </select>
              <button className="btn btn--solid btn--sm" type="button" onClick={addTrip} disabled={saving}>Save</button>
            </div>
            <p className={`dash-note${note?.state === 'error' ? ' is-error' : ''}${note?.state === 'success' ? ' is-success' : ''}`} role="status">{note?.msg || ''}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
