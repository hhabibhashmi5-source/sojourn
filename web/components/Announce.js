'use client';
// Dismissible announcement strip — home page only.
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Announce() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  if (pathname !== '/' || hidden) return null;
  return (
    <div className={`announce${hidden ? ' is-hidden' : ''}`} id="announce">
      <p className="announce__text">Complimentary itinerary consultation for new members this season</p>
      <button className="announce__close" aria-label="Dismiss announcement" onClick={() => setHidden(true)}>&times;</button>
    </div>
  );
}
