'use client';
// Calls the Supabase Edge Function `itinerary` (Claude server-side; the API key
// lives in Supabase secrets, never the browser). Ported from vanilla itinerary.js.
import { useState } from 'react';
import Link from 'next/link';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';

const FN_URL = SUPABASE_URL ? SUPABASE_URL.replace(/\/$/, '') + '/functions/v1/itinerary' : '';

export default function ItineraryClient() {
  const [status, setStatus] = useState('empty'); // 'empty' | 'loading' | 'doc'
  const [itin, setItin] = useState(null);
  const [note, setNote] = useState('');
  const [form, setForm] = useState({ destination: '', days: '5', month: '', travelers: '', pace: 'balanced', budget: '', interests: '', notes: '' });

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const destination = form.destination.trim();
    if (!destination) { setNote('Please enter a destination.'); return; }
    if (!FN_URL) { setNote("The itinerary service isn't configured yet."); return; }

    setNote(''); setStatus('loading');
    const payload = {
      destination,
      days: parseInt(form.days, 10) || 5,
      month: form.month.trim(),
      travelers: form.travelers.trim(),
      pace: form.pace,
      budget: form.budget,
      interests: form.interests.trim(),
      notes: form.notes.trim(),
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', apikey: SUPABASE_ANON_KEY, authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = await res.json();
      if (res.ok && data && data.itinerary) { setItin(data.itinerary); setStatus('doc'); }
      else { setStatus('empty'); setNote((data && data.error) || "Couldn't compose an itinerary. Please try again."); }
    } catch (err) {
      setStatus('empty');
      setNote(err && err.name === 'AbortError' ? 'That took too long. Please try again with a shorter trip.' : 'Network error — is the itinerary service deployed? Please try again.');
    } finally {
      clearTimeout(timer);
    }
  };

  return (
    <div className="itin-layout">
      <div className="itin-form">
        <h2>Shape your journey</h2>
        <p className="itin-form__sub">Only a destination is required.</p>
        <form noValidate onSubmit={onSubmit}>
          <div className="field"><label htmlFor="itDest">Destination</label><input id="itDest" type="text" placeholder="e.g. Kyoto, the Amalfi Coast…" maxLength="80" required value={form.destination} onChange={(e) => set('destination', e.target.value)} /></div>
          <div className="field-grid">
            <div className="field"><label htmlFor="itDays">Days</label><input id="itDays" type="number" min="1" max="14" value={form.days} onChange={(e) => set('days', e.target.value)} /></div>
            <div className="field"><label htmlFor="itMonth">When</label><input id="itMonth" type="text" placeholder="September" maxLength="30" value={form.month} onChange={(e) => set('month', e.target.value)} /></div>
          </div>
          <div className="field-grid">
            <div className="field"><label htmlFor="itTravelers">Travellers</label><input id="itTravelers" type="text" placeholder="2 adults" maxLength="40" value={form.travelers} onChange={(e) => set('travelers', e.target.value)} /></div>
            <div className="field"><label htmlFor="itPace">Pace</label>
              <select id="itPace" value={form.pace} onChange={(e) => set('pace', e.target.value)}><option value="relaxed">Relaxed</option><option value="balanced">Balanced</option><option value="full">Full &amp; active</option></select>
            </div>
          </div>
          <div className="field"><label htmlFor="itBudget">Budget level</label>
            <select id="itBudget" value={form.budget} onChange={(e) => set('budget', e.target.value)}><option value="">No preference</option><option>Comfortable</option><option>Luxury</option><option>Ultra-luxury</option></select>
          </div>
          <div className="field"><label htmlFor="itInterests">Interests</label><input id="itInterests" type="text" placeholder="food, art, spa, hiking…" maxLength="200" value={form.interests} onChange={(e) => set('interests', e.target.value)} /></div>
          <div className="field"><label htmlFor="itNotes">Anything else?</label><textarea id="itNotes" rows="2" maxLength="400" placeholder="Dietary needs, must-sees, things to avoid…" value={form.notes} onChange={(e) => set('notes', e.target.value)}></textarea></div>
          <button className="btn btn--solid" type="submit" style={{ width: '100%', marginTop: '0.4rem' }} disabled={status === 'loading'}>{status === 'loading' ? 'Composing…' : 'Compose my itinerary'}</button>
          <p className={`itin-note${note ? ' is-error' : ''}`} role="status">{note}</p>
        </form>
      </div>

      <div className="itin-result" aria-live="polite">
        {status === 'empty' && (
          <div className="itin-empty"><span className="itin-empty__mark">✦</span><p>Your composed itinerary will appear here.<br />Fill in a destination and press <em>Compose</em>.</p></div>
        )}
        {status === 'loading' && (
          <div className="itin-loading"><div className="itin-spinner"></div><p>Your advisor is composing a considered plan…<br /><small>This can take up to a minute.</small></p></div>
        )}
        {status === 'doc' && itin && (
          <article className="itin-doc">
            <h2 className="itin-doc__title">{itin.title || 'Your itinerary'}</h2>
            {itin.overview && <p className="itin-doc__overview">{itin.overview}</p>}
            {(itin.days || []).map((d, i) => (
              <div className="itin-day" key={i}>
                <div className="itin-day__head"><span className="itin-day__no">Day {d.day != null ? d.day : ''}</span><span className="itin-day__title">{d.title || ''}</span></div>
                <div className="itin-slot"><div className="itin-slot__k">Morning</div><div className="itin-slot__v">{d.morning || '—'}</div></div>
                <div className="itin-slot"><div className="itin-slot__k">Afternoon</div><div className="itin-slot__v">{d.afternoon || '—'}</div></div>
                <div className="itin-slot"><div className="itin-slot__k">Evening</div><div className="itin-slot__v">{d.evening || '—'}</div></div>
              </div>
            ))}
            {itin.tips && itin.tips.length > 0 && (
              <div className="itin-tips"><h3>Advisor&apos;s tips</h3><ul>{itin.tips.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
            )}
            <div className="itin-actions">
              <Link className="btn btn--solid" href="/booking">Have an advisor perfect this</Link>
              <button className="btn btn--ghost-dark" type="button" onClick={() => { setStatus('empty'); setNote(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Compose another</button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
