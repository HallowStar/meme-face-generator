export const flexiblePoses = {
  cup: { name: 'Cupped palm', topic: 'power-up', match: 'fist', title: 'POWER IN MY HANDS' },
  smirk: { name: 'Smirk', topic: 'smirking', title: 'I KNOW SOMETHING', traits: { smirk: 0.42 } },
  squint: { name: 'Skeptical look', topic: 'squinting-in-confusion', title: 'SOMETHING FEELS OFF', traits: { squint: 0.48 } },
  pout: { name: 'Pout', topic: 'pouting-lip', title: 'THIS IS UNFAIR', traits: { pucker: 0.48 } },
  puff: { name: 'Puffed cheeks', topic: 'puffed-cheeks', title: 'HOLDING IT TOGETHER', traits: { puff: 0.45 } },
  scowl: { name: 'Scowl', topic: 'scowling', title: 'ABSOLUTELY NOT', traits: { scowl: 0.44 } },
  frown: { name: 'Frown', topic: 'disappointed-face', title: 'WELL, THAT HAPPENED', traits: { frown: 0.45 } },
  yawn: { name: 'Yawn', topic: 'yawn', title: 'WAKE ME UP LATER', traits: { jaw: 0.62 } },
  down: { name: 'Thumbs down', topic: 'thumbs-down', title: 'DECLINED' },
  point: { name: 'Pointing up', topic: 'pointing-up', title: 'ONE MORE THING' },
  ily: { name: 'I love you sign', topic: 'i-love-you-sign-language', title: 'SENDING GOOD VIBES' },
  deadpan: { name: 'Deadpan', topic: 'deadpan-stare', title: 'I HAVE NO WORDS' },
};

const cues = Object.entries(flexiblePoses)
  .filter(([, pose]) => pose.traits)
  .map(([id, pose]) => [id, ...Object.entries(pose.traits)[0]]);

export function closestFacePose(features, automatic = false) {
  let best = automatic ? null : 'deadpan';
  let strength = automatic ? 1 : 0.57;
  if (!automatic) {
    const familiar = {
      shock: Math.min(features.jaw / 0.43, Math.max(features.brow / 0.35, features.eyes / 0.29)),
      smile: features.smile / 0.52,
      wink: Math.min(features.wink / 0.29, features.closedEye / 0.46),
    };
    for (const [id, evidence] of Object.entries(familiar)) {
      if (evidence >= strength) {
        best = id;
        strength = evidence;
      }
    }
  }
  for (const [id, key, threshold] of cues) {
    // Ignore ordinary blinks and keep talking or a mild smile from becoming a yawn.
    if (id === 'squint' && features.closedEye > 0.60) continue;
    if (id === 'yawn' && (features.eyes > 0.23 || features.smile > 0.40)) continue;
    const evidence = features[key] / threshold;
    if (evidence >= strength) {
      best = id;
      strength = evidence;
    }
  }
  return best;
}
