import catalog from './meme-catalog.json?v=flexible-poses' with { type: 'json' };
import { flexiblePoses } from './flexible-poses.mjs?v=flexible-poses';

const weightsByReaction = {
  shock: { jaw: 0.55, brow: 0.20, eyes: 0.25 },
  smile: { smile: 0.72, jaw: 0.28 },
  wink: { wink: 0.65, smile: 0.23, jaw: 0.12 },
};

function expressionDistance(features, traits, weights) {
  return Object.entries(weights).reduce((distance, [key, weight]) => (
    distance + weight * Math.abs(features[key] - traits[key])
  ), 0);
}

export function matchReaction(reaction, features, startAt = 0) {
  const entries = catalog[reaction] ?? [];
  if (!entries.length) return { items: [], mode: 'rotation' };
  const index = startAt % entries.length;
  const items = [...entries.slice(index), ...entries.slice(0, index)];
  const flexibleTraits = Object.keys(flexiblePoses[reaction]?.traits ?? {});
  const weights = weightsByReaction[reaction] ?? (flexibleTraits.length
    ? Object.fromEntries(flexibleTraits.map((key) => [key, 1 / flexibleTraits.length]))
    : null);

  if (!weights) return { items, mode: reaction === 'deadpan' ? 'rotation' : 'gesture' };
  if (!features || Object.keys(weights).some((key) => !Number.isFinite(features[key]))) {
    return { items, mode: 'rotation' };
  }

  const ranked = items.filter((entry) => entry.traits).map((entry) => ({
    entry,
    distance: expressionDistance(features, entry.traits, weights),
  })).sort((a, b) => a.distance - b.distance);

  if (!ranked.length || ranked[0].distance > 0.28) return { items, mode: 'rotation' };
  return { items: ranked.map(({ entry }) => entry), mode: 'expression' };
}
