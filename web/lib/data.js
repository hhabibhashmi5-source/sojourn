// Destination content — single source of truth for the whole app.
// (Snapshot of the original tools/destinations.data.js, as an ES module.)
import data from './destinations.data.js';

export const U = data.U;                 // (id, w) => Unsplash URL
export const site = data.site;
export const destinations = data.destinations;

export const bySlug = (slug) => destinations.find((d) => d.slug === slug);

// The five regions, in display order, used by the destinations filter.
export const REGIONS = ['Islands', 'Coast', 'Mountains', 'Culture', 'Countryside'];

// One-line card blurbs for the index/home grids (kept out of the big data file).
export const BLURBS = {
  maldives: 'Whole-island buyouts where the only schedule is the tide.',
  'swiss-alps': 'Low-density chalets and clinical spa programmes at altitude.',
  'amalfi-coast': 'Staffed villas and lemon-grove terraces above the tide.',
  kyoto: 'Private ryokan stays, tea masters and mornings before the crowds.',
  cyclades: 'Cave houses and private caïques between quieter islands.',
  provence: 'Private mas, market mornings and cellars off the map.',
  bali: 'Cliff villas above Uluwatu and healers in the Ubud hills.',
  norway: 'Design lodges, private vessels and the long northern light.',
  marrakech: 'Private courtyards, artisan ateliers and the High Atlas beyond.',
};
