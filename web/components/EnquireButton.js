'use client';
import { useModal } from './ModalProvider';

// Opens the inquiry modal, optionally pre-filling the destination field.
export default function EnquireButton({ destination, className = 'btn btn--sm btn--solid', children = 'Enquire' }) {
  const { openModal } = useModal();
  return (
    <button className={className} type="button" onClick={() => openModal('inquiry', { destination })}>
      {children}
    </button>
  );
}
