'use client';
// Multi-step booking request builder with a live summary. Captures to the
// Supabase `inquiries` table via the data layer. Ported from vanilla booking.js.
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { destinations } from '@/lib/data';
import { db } from '@/lib/db';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OCCASIONS = ['Wellness', 'Honeymoon', 'Family', 'Cultural', 'Adventure', 'Celebration'];
const STYLES = ['Private villa', 'Boutique hotel', 'Resort suite', 'Whole-island'];
const INTERESTS = ['Spa & wellness', 'Fine dining', 'Diving & water', 'Hiking & nature', 'Culture & guides', "Kids' programme"];
const BUDGETS = ['$1,000 – 2,000', '$2,000 – 5,000', '$5,000 – 10,000', '$10,000+', 'Flexible'];
const STEP_TITLES = ['Where & when', 'Who & how', 'Preferences', 'Your details'];

export default function BookingWizard() {
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [state, setState] = useState({
    destination: params.get('destination') || '', when: '', nights: '',
    adults: '2', children: '0', occasion: '', style: '', budget: '',
    interests: [], notes: '', name: '', email: '', phone: '',
  });

  const set = (k, v) => setState((s) => ({ ...s, [k]: v }));
  const toggleMulti = (k, v) => setState((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  const travellers = () => {
    const a = parseInt(state.adults, 10) || 0, c = parseInt(state.children, 10) || 0;
    const parts = [];
    if (a) parts.push(`${a} adult${a > 1 ? 's' : ''}`);
    if (c) parts.push(`${c} child${c > 1 ? 'ren' : ''}`);
    return parts.join(', ');
  };

  const validate = (i) => {
    if (i === 0) {
      if (!state.destination) return "Please choose a destination (or 'Not sure yet').";
      if (!state.when.trim()) return 'Roughly when would you like to travel?';
    }
    if (i === 3) {
      if (!state.name.trim()) return 'Please tell us your name.';
      if (!EMAIL_RE.test(state.email)) return 'Please enter a valid email.';
    }
    return null;
  };

  const composeMessage = () => {
    const lines = [];
    if (params.get('tier')) lines.push(`Tier: ${params.get('tier')}`);
    if (state.occasion) lines.push(`Occasion: ${state.occasion}`);
    if (state.style) lines.push(`Stay style: ${state.style}`);
    if (state.budget) lines.push(`Budget/night: ${state.budget}`);
    if (state.interests.length) lines.push(`Interests: ${state.interests.join(', ')}`);
    if (state.phone) lines.push(`Phone: ${state.phone}`);
    if (state.notes) lines.push(`Notes: ${state.notes}`);
    return lines.join('\n') || null;
  };

  const submit = async () => {
    setBusy(true); setNote('');
    const payload = {
      type: params.get('type') === 'advisory' ? 'advisory' : 'booking',
      name: state.name.trim(),
      email: state.email.trim(),
      destination: state.destination || null,
      travel_dates: (state.when + (state.nights ? ` (${state.nights} nights)` : '')).trim() || null,
      party_size: ((parseInt(state.adults, 10) || 0) + (parseInt(state.children, 10) || 0)) || null,
      message: composeMessage(),
    };
    let result = { ok: false, offline: true };
    try { result = await db.capture('inquiries', payload); }
    catch (e) { console.error('[Sojourn] booking error:', e); result = { ok: false }; }
    if (result.ok || result.offline) setDone(true);
    else { setNote('Something went wrong. Please try again.'); setBusy(false); }
  };

  const next = () => {
    const err = validate(step);
    if (err) { setNote(err); return; }
    if (step < 3) { setStep(step + 1); setNote(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else submit();
  };
  const back = () => { if (step > 0) { setStep(step - 1); setNote(''); } };

  const sum = (val, empty) => <span className={`summary__val${val ? '' : ' is-empty'}`}>{val || empty}</span>;

  if (done) {
    return (
      <div className="booking-confirm is-active">
        <span className="booking-confirm__mark">✦</span>
        <h2 className="booking-confirm__title">Request received</h2>
        <p className="booking-confirm__text">Thank you, <strong>{state.name.split(' ')[0] || 'traveller'}</strong>. Your <strong>{state.destination || 'journey'}</strong> request is with our advisors — expect a considered proposal within two working days.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn--solid" href="/">Back to Home</Link>
          <Link className="btn btn--ghost-dark" href="/destinations">Explore Destinations</Link>
        </div>
      </div>
    );
  }

  const Option = ({ field, value, multi }) => {
    const selected = multi ? state[field].includes(value) : state[field] === value;
    return (
      <button type="button" className={`option${selected ? ' is-selected' : ''}`} onClick={() => (multi ? toggleMulti(field, value) : set(field, value))}>{value}</button>
    );
  };

  return (
    <div className="booking__layout">
      <div className="wizard" id="wizardCard">
        <div className="wizard__progress" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => <span key={i} className={`wizard__dot${i < step ? ' is-done' : ''}${i === step ? ' is-current' : ''}`}></span>)}
        </div>
        <p className="wizard__stepno">Step {step + 1} of 4</p>

        <form onSubmit={(e) => e.preventDefault()} noValidate>
          {step === 0 && (
            <div className="wizard__panel is-active">
              <h2 className="wizard__steptitle">Where &amp; when</h2>
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="bkDest">Destination</label>
                  <select id="bkDest" value={state.destination} onChange={(e) => set('destination', e.target.value)}>
                    <option value="">Select…</option>
                    {destinations.map((d) => <option key={d.slug}>{d.name}</option>)}
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                </div>
                <div className="field"><label htmlFor="bkNights">Nights</label><input id="bkNights" type="number" min="1" max="60" placeholder="7" value={state.nights} onChange={(e) => set('nights', e.target.value)} /></div>
              </div>
              <div className="field"><label htmlFor="bkWhen">When (approximately)</label><input id="bkWhen" type="text" placeholder="September 2026 · flexible by a week" value={state.when} onChange={(e) => set('when', e.target.value)} /></div>
            </div>
          )}

          {step === 1 && (
            <div className="wizard__panel is-active">
              <h2 className="wizard__steptitle">Who &amp; how</h2>
              <div className="field-grid">
                <div className="field"><label htmlFor="bkAdults">Adults</label><input id="bkAdults" type="number" min="1" max="20" value={state.adults} onChange={(e) => set('adults', e.target.value)} /></div>
                <div className="field"><label htmlFor="bkChildren">Children</label><input id="bkChildren" type="number" min="0" max="20" value={state.children} onChange={(e) => set('children', e.target.value)} /></div>
              </div>
              <div className="field"><label>Occasion</label><div className="option-grid">{OCCASIONS.map((o) => <Option key={o} field="occasion" value={o} />)}</div></div>
              <div className="field"><label>Where you&apos;ll stay</label><div className="option-grid option-grid--2">{STYLES.map((o) => <Option key={o} field="style" value={o} />)}</div></div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard__panel is-active">
              <h2 className="wizard__steptitle">Preferences</h2>
              <div className="field"><label>Interests <small style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--taupe-2)' }}>(choose any)</small></label><div className="option-grid">{INTERESTS.map((o) => <Option key={o} field="interests" value={o} multi />)}</div></div>
              <div className="field">
                <label htmlFor="bkBudget">Budget per night</label>
                <select id="bkBudget" value={state.budget} onChange={(e) => set('budget', e.target.value)}><option value="">Select…</option>{BUDGETS.map((b) => <option key={b}>{b}</option>)}</select>
              </div>
              <div className="field"><label htmlFor="bkNotes">Anything else?</label><textarea id="bkNotes" rows="3" placeholder="Dietary needs, must-haves, things to avoid…" value={state.notes} onChange={(e) => set('notes', e.target.value)}></textarea></div>
            </div>
          )}

          {step === 3 && (
            <div className="wizard__panel is-active">
              <h2 className="wizard__steptitle">Your details</h2>
              <div className="field-grid">
                <div className="field"><label htmlFor="bkName">Full name</label><input id="bkName" type="text" autoComplete="name" value={state.name} onChange={(e) => set('name', e.target.value)} /></div>
                <div className="field"><label htmlFor="bkEmail">Email</label><input id="bkEmail" type="email" autoComplete="email" value={state.email} onChange={(e) => set('email', e.target.value)} /></div>
              </div>
              <div className="field"><label htmlFor="bkPhone">Phone (optional)</label><input id="bkPhone" type="tel" autoComplete="tel" value={state.phone} onChange={(e) => set('phone', e.target.value)} /></div>
              <p style={{ fontSize: '0.85rem', color: 'var(--taupe)', marginTop: '0.8rem' }}>We&apos;ll only use these to plan your trip. No spam, ever.</p>
            </div>
          )}

          <div className="wizard__nav">
            <button type="button" className="btn btn--ghost-dark" style={{ visibility: step === 0 ? 'hidden' : 'visible' }} onClick={back} disabled={busy}>Back</button>
            <button type="button" className="btn btn--solid" onClick={next} disabled={busy}>{busy ? 'Sending…' : step === 3 ? 'Submit Request' : 'Continue'}</button>
          </div>
          <p className={`wizard__note${note ? ' is-error' : ''}`} role="status">{note}</p>
        </form>
      </div>

      <aside className="summary" aria-label="Trip summary">
        <p className="summary__title">Your journey</p>
        <p className="summary__sub">A living summary as you go</p>
        <div className="summary__row"><span className="summary__key">Destination</span>{sum(state.destination, 'To decide')}</div>
        <div className="summary__row"><span className="summary__key">Dates</span>{sum(state.when ? state.when + (state.nights ? ` · ${state.nights} nights` : '') : '', 'To decide')}</div>
        <div className="summary__row"><span className="summary__key">Travellers</span>{sum(travellers(), '—')}</div>
        <div className="summary__row"><span className="summary__key">Occasion</span>{sum(state.occasion, 'Any')}</div>
        <div className="summary__row"><span className="summary__key">Stay</span>{sum(state.style, "Advisor's pick")}</div>
        <div className="summary__row"><span className="summary__key">Budget</span>{sum(state.budget, 'Flexible')}</div>
        <p className="summary__foot"><span className="map-box__pin" style={{ fontSize: '1rem' }}>✦</span> No payment now — a proposal first.</p>
      </aside>
    </div>
  );
}
