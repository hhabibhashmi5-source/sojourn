import { U } from './data';

export const CATEGORIES = ['Slow Travel', 'Conscious Luxury', 'Wellness', 'Design', 'Culture', 'Gastronomy'];

export const featured = {
  cat: 'Slow Travel',
  badge: "Editor's pick",
  read: '6 min read',
  title: 'Shoulder season is the new peak',
  excerpt: 'The discerning are quietly abandoning July. We make the case for the softer light, open tables and halved crowds of the in-between months — and how to plan around them.',
  href: '/article',
  img: { src: U('photo-1470071459604-3b5ec3a7fe05', 1000), alt: 'Mist drifting through a forested valley.' },
};

export const posts = [
  { cat: 'Conscious Luxury', read: '8 min read', title: 'The quiet case for conscious luxury', excerpt: 'Sustainability has quietly become the ultimate status symbol. What it actually asks of the traveler.', href: '/article', img: { src: U('photo-1441974231531-c6227db76b6e', 800), alt: 'Sunlight falling through an old forest.' } },
  { cat: 'Design', read: '5 min read', title: 'Rooms that ask nothing of you', excerpt: 'On the rise of the un-designed suite — and why true luxury increasingly means restraint.', href: '/article', img: { src: U('photo-1512918728675-ed5a9ecdebfd', 800), alt: 'A restrained, light-filled bedroom in warm daylight.' } },
  { cat: 'Wellness', read: '7 min read', title: 'The overwater spa, reconsidered', excerpt: 'Beyond the massage menu: what a genuinely restorative week is engineered to feel like.', href: '/article', img: { src: U('photo-1571003123894-1f0594d2b5d9', 800), alt: 'Serene spa water at the edge of the sea.' } },
  { cat: 'Gastronomy', read: '6 min read', title: 'A table for two on an empty sandbank', excerpt: 'The theatre of the private dinner — and why the best meals now have no other guests.', href: '/article', img: { src: U('photo-1467003909585-2f8a72700288', 800), alt: 'A plated course at a private dinner.' } },
  { cat: 'Culture', read: '9 min read', title: 'Kyoto before the crowds', excerpt: "How a private guide and a 6am start turn the world's most photographed city into your own.", href: '/article', img: { src: U('photo-1478436127897-769e1b3f0f36', 800), alt: 'Vermilion torii gates along an empty Kyoto path.' } },
  { cat: 'Slow Travel', read: '5 min read', title: 'The art of the slow itinerary', excerpt: 'Why we now plan half as much per day — and how the empty hours became the point.', href: '/article', img: { src: U('photo-1500530855697-b586d89ba3ee', 800), alt: 'An open road winding between red rock hills.' } },
];
