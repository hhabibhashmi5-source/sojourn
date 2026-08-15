'use client';
// Newsletter signup → Supabase subscribers, with graceful offline fallback.
// Ported from vanilla main.js.
import { useState } from 'react';
import { db } from '@/lib/db';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterForm() {
  const [note, setNote] = useState({ msg: 'By joining you agree to our privacy policy. Unsubscribe anytime.', state: null });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const input = e.currentTarget.elements.email;
    const value = (input.value || '').trim();
    if (!EMAIL_RE.test(value)) { setNote({ msg: 'Please enter a valid email address.', state: 'error' }); input.focus(); return; }

    setBusy(true); setNote({ msg: 'Sending…', state: null });
    let result = { ok: false, offline: true };
    try { result = await db.subscribe(value, { source: 'homepage' }); }
    catch (err) { console.error('[Sojourn] subscribe error:', err); result = { ok: false, error: err }; }

    if (result.ok) {
      setNote({ msg: result.duplicate ? "You're already on the list — thank you." : 'Thank you — your invitation is on its way.', state: 'success' });
      e.target.reset();
    } else if (result.offline) {
      setNote({ msg: 'Thank you — your invitation is on its way.', state: 'success' });
      e.target.reset();
    } else {
      setNote({ msg: 'Something went wrong. Please try again.', state: 'error' });
    }
    setBusy(false);
  };

  return (
    <>
      <form className="signup" noValidate onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="email">Email address</label>
        <input className="signup__input" type="email" id="email" name="email" placeholder="you@email.com" autoComplete="email" required />
        <button className="btn btn--solid" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Request an Invitation'}</button>
      </form>
      <p className={`signup__note${note.state === 'success' ? ' is-success' : ''}${note.state === 'error' ? ' is-error' : ''}`} role="status">{note.msg}</p>
    </>
  );
}
