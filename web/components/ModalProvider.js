'use client';
// Global modals: Bespoke-Advisory inquiry + member Auth. Any component can open
// them via useModal().openModal('inquiry'|'auth'). Ported from vanilla forms.js.
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { db } from '@/lib/db';

const ModalCtx = createContext({ openModal: () => {}, closeModal: () => {} });
export const useModal = () => useContext(ModalCtx);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ModalProvider({ children }) {
  const [open, setOpen] = useState(null);        // null | 'inquiry' | 'auth'
  const [prefillDest, setPrefillDest] = useState('');
  const inquiryRef = useRef(null);
  const authRef = useRef(null);

  const openModal = useCallback((name, opts = {}) => {
    if (name === 'inquiry') setPrefillDest(opts.destination || '');
    // Close the mobile menu if open.
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
    setOpen(name === 'auth' ? 'auth' : 'inquiry');
  }, []);

  const closeModal = useCallback(() => setOpen(null), []);

  // Drive the native <dialog> from state.
  useEffect(() => {
    const dialogs = { inquiry: inquiryRef.current, auth: authRef.current };
    Object.entries(dialogs).forEach(([name, dlg]) => {
      if (!dlg) return;
      const shouldOpen = open === name;
      if (shouldOpen && !dlg.open) dlg.showModal?.();
      if (!shouldOpen && dlg.open) dlg.close?.();
    });
    document.body.classList.toggle('modal-open', !!open);
  }, [open]);

  const backdrop = (e) => { if (e.target === e.currentTarget) closeModal(); };

  return (
    <ModalCtx.Provider value={{ openModal, closeModal }}>
      {children}
      <InquiryModal dialogRef={inquiryRef} onCancel={closeModal} onBackdrop={backdrop} onClose={closeModal} prefillDest={prefillDest} />
      <AuthModal dialogRef={authRef} onCancel={closeModal} onBackdrop={backdrop} onClose={closeModal} />
    </ModalCtx.Provider>
  );
}

function Note({ note }) {
  return (
    <p className={`modal__note${note?.state === 'success' ? ' is-success' : ''}${note?.state === 'error' ? ' is-error' : ''}`} role="status">
      {note?.msg || ''}
    </p>
  );
}

/* ---------- Inquiry ---------- */
function InquiryModal({ dialogRef, onCancel, onBackdrop, onClose, prefillDest }) {
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      type: f.get('type') || 'advisory',
      name: (f.get('name') || '').trim(),
      email: (f.get('email') || '').trim(),
      destination: (f.get('destination') || '').trim() || null,
      travel_dates: (f.get('dates') || '').trim() || null,
      party_size: f.get('party') ? parseInt(f.get('party'), 10) : null,
      message: (f.get('message') || '').trim() || null,
    };
    if (!payload.name) { setNote({ msg: 'Please share your name.', state: 'error' }); return; }
    if (!EMAIL_RE.test(payload.email)) { setNote({ msg: 'Please enter a valid email.', state: 'error' }); return; }

    setBusy(true); setNote({ msg: 'Sending your request…' });
    let result = { ok: false, offline: true };
    try { result = await db.capture('inquiries', payload); }
    catch (err) { console.error('[Sojourn] inquiry error:', err); result = { ok: false, error: err }; }

    if (result.ok || result.offline) {
      setNote({ msg: `Thank you, ${payload.name.split(' ')[0]}. An advisor will be in touch shortly.`, state: 'success' });
      e.target.reset();
    } else {
      setNote({ msg: 'Something went wrong. Please try again.', state: 'error' });
    }
    setBusy(false);
  };

  return (
    <dialog className="modal" ref={dialogRef} aria-labelledby="inquiryTitle" onCancel={(e) => { e.preventDefault(); onCancel(); }} onClick={onBackdrop} onClose={onClose}>
      <form className="modal__panel" noValidate onSubmit={onSubmit}>
        <button className="modal__close" type="button" aria-label="Close" onClick={onClose}>&times;</button>
        <p className="overline">Bespoke Advisory</p>
        <h2 className="modal__title" id="inquiryTitle">Begin your journey</h2>
        <p className="modal__sub">Tell us a little, and a dedicated advisor will be in touch. No obligation.</p>
        <div className="field-grid">
          <div className="field"><label htmlFor="iqName">Full name</label><input id="iqName" name="name" type="text" autoComplete="name" required /></div>
          <div className="field"><label htmlFor="iqEmail">Email</label><input id="iqEmail" name="email" type="email" autoComplete="email" required /></div>
          <div className="field"><label htmlFor="iqDestination">Destination of interest</label><input id="iqDestination" name="destination" type="text" placeholder="Maldives, Kyoto…" defaultValue={prefillDest} key={prefillDest} /></div>
          <div className="field"><label htmlFor="iqDates">Approximate dates</label><input id="iqDates" name="dates" type="text" placeholder="Sept 2026, flexible…" /></div>
          <div className="field"><label htmlFor="iqParty">Party size</label><input id="iqParty" name="party" type="number" min="1" max="30" placeholder="2" /></div>
          <div className="field"><label htmlFor="iqType">Enquiry type</label>
            <select id="iqType" name="type" defaultValue="advisory"><option value="advisory">Advisory / concierge</option><option value="booking">Specific booking</option></select>
          </div>
        </div>
        <div className="field"><label htmlFor="iqMessage">What are you dreaming of?</label><textarea id="iqMessage" name="message" rows="3" placeholder="A quiet week, mostly resting, somewhere warm…"></textarea></div>
        <button className="btn btn--solid modal__submit" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Request Consultation'}</button>
        <Note note={note} />
      </form>
    </dialog>
  );
}

/* ---------- Auth ---------- */
function AuthModal({ dialogRef, onCancel, onBackdrop, onClose }) {
  const [mode, setMode] = useState('signin');   // 'signin' | 'register'
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';
  const toggle = () => { setMode(isRegister ? 'signin' : 'register'); setNote(null); };

  const onSubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = (f.get('email') || '').trim();
    const password = f.get('password') || '';
    const username = (f.get('username') || '').trim();

    if (isRegister && username.length < 2) { setNote({ msg: 'Please choose a username (2+ characters).', state: 'error' }); return; }
    if (!EMAIL_RE.test(email)) { setNote({ msg: 'Please enter a valid email.', state: 'error' }); return; }
    if (password.length < 6) { setNote({ msg: 'Password must be at least 6 characters.', state: 'error' }); return; }
    if (!db.isReady()) { setNote({ msg: 'Member accounts activate once Supabase is connected.', state: 'error' }); return; }

    setBusy(true); setNote(null);
    let result;
    try {
      result = isRegister ? await db.auth.register(email, password, username) : await db.auth.signIn(email, password);
    } catch (err) { console.error('[Sojourn] auth error:', err); result = { ok: false, error: err }; }

    if (result.ok && result.needsConfirm) {
      setNote({ msg: 'Almost there — check your inbox to confirm your email.', state: 'success' });
    } else if (result.ok) {
      setNote({ msg: isRegister ? `Welcome to Sojourn, ${username}.` : 'Welcome back.', state: 'success' });
      setTimeout(onClose, 700);
    } else {
      setNote({ msg: (result.error && result.error.message) || 'Unable to continue. Please try again.', state: 'error' });
    }
    setBusy(false);
  };

  return (
    <dialog className="modal modal--sm" ref={dialogRef} aria-labelledby="authTitle" onCancel={(e) => { e.preventDefault(); onCancel(); }} onClick={onBackdrop} onClose={onClose}>
      <form className="modal__panel" noValidate onSubmit={onSubmit}>
        <button className="modal__close" type="button" aria-label="Close" onClick={onClose}>&times;</button>
        <p className="overline">Membership</p>
        <h2 className="modal__title" id="authTitle">{isRegister ? 'Join Sojourn' : 'Welcome back'}</h2>
        <p className="modal__sub">{isRegister ? 'Create your member profile.' : 'Sign in to your member profile.'}</p>
        {isRegister && (
          <div className="field"><label htmlFor="auUsername">Username</label><input id="auUsername" name="username" type="text" autoComplete="username" maxLength="30" placeholder="Choose a username" /></div>
        )}
        <div className="field"><label htmlFor="auEmail">Email</label><input id="auEmail" name="email" type="email" autoComplete="email" required /></div>
        <div className="field"><label htmlFor="auPassword">Password</label><input id="auPassword" name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength="6" required /></div>
        <button className="btn btn--solid modal__submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In'}</button>
        <Note note={note} />
        <p className="modal__switch">
          <span>{isRegister ? 'Already a member?' : 'New to Sojourn?'}</span>{' '}
          <button type="button" className="link-inline" onClick={toggle}>{isRegister ? 'Sign in instead' : 'Create an account'}</button>
        </p>
      </form>
    </dialog>
  );
}
