// Vocabulary reviewed from Datamuse's /words results for each reaction.
export const reactionContent = {
  shock: {
    topic: 'ishowspeed-shocked',
    words: ['shock', 'amazement', 'astonishment'],
    captions: [
      [null, 'PURE {word}'],
      ['WHEN THE PLOT TWIST HAS A PLOT TWIST', '{word} LEVELS CRITICAL'],
    ],
  },
  smile: {
    topic: 'smiling-monkey',
    words: ['victory', 'triumph', 'glory'],
    captions: [
      [null, 'SMELLS LIKE {word}'],
      ['WHEN THE PLAN ACTUALLY WORKS', '{word} MODE ACTIVATED'],
    ],
  },
  wink: {
    topic: 'wink',
    words: ['prank', 'plot', 'hoax'],
    captions: [
      [null, 'WHAT {word}?'],
      ['WHEN THEY ASK IF YOU KNOW ANYTHING', 'I KNOW NOTHING ABOUT THE {word}'],
    ],
  },
  thumb: {
    topic: 'thumbs-up',
    words: ['approved', 'acceptable', 'admirable'],
    captions: [
      [null, 'CERTIFIED {word}'],
      ['WHEN THE GROUP FINALLY AGREES', 'THE OFFICIAL VERDICT IS {word}'],
    ],
  },
  peace: {
    topic: 'peace-out',
    words: ['adios', 'so long', 'later', 'bye-bye'],
    captions: [
      [null, '{word}, EVERYONE'],
      ['WHEN THE CLOCK HITS FIVE', '{word}. I’M OUT.'],
    ],
  },
  palm: {
    topic: 'hold-up',
    words: ['break', 'delay', 'hiatus', 'intermission'],
    captions: [
      [null, 'UNSCHEDULED {word}'],
      ['WHEN SOMEBODY SAYS “ONE MORE THING”', 'TIME FOR A BRIEF {word}'],
    ],
  },
  fist: {
    topic: 'power-up',
    words: ['stamina', 'vigor', 'force', 'intensity'],
    captions: [
      [null, 'MAXIMUM {word} UNLOCKED'],
      ['WHEN THE FINAL ROUND STARTS', '{word} LEVELS RISING'],
    ],
  },
};

export function pickReactionCaption(reaction, excluded) {
  const content = reactionContent[reaction.id];
  const choices = content ? content.captions.flatMap(([top, bottom]) => (
    content.words.map((word) => ({ top: top ?? reaction.top, bottom: bottom.replace('{word}', word.toUpperCase()) }))
  )) : ['ME IN THIS EXACT MOMENT', 'THE FACE SAYS IT ALL', 'WHEN IT FINALLY SINKS IN']
    .map((top) => ({ top, bottom: reaction.title }));
  const available = choices.filter(({ top, bottom }) => !excluded.some((pair) => top === pair?.top && bottom === pair?.bottom));
  return available[Math.floor(Math.random() * available.length)];
}
