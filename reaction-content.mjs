// Vocabulary reviewed from Datamuse's /words results for each reaction.
export const reactionContent = {
  shock: {
    gif: { id: '6tyvhr7zaoHOYuOtg7', title: 'iShowSpeed shocked', topic: 'ishowspeed-shocked' },
    words: ['shock', 'amazement', 'astonishment'],
    captions: [
      [null, 'PURE {word}'],
      ['WHEN THE PLOT TWIST HAS A PLOT TWIST', '{word} LEVELS CRITICAL'],
    ],
  },
  smile: {
    gif: { id: '9G50jwiTVJtUCZ83bW', title: 'Grinning monkey', topic: 'smiling-monkey' },
    words: ['victory', 'triumph', 'glory'],
    captions: [
      [null, 'SMELLS LIKE {word}'],
      ['WHEN THE PLAN ACTUALLY WORKS', '{word} MODE ACTIVATED'],
    ],
  },
  wink: {
    gif: { id: 'Xbz9rDFWrtyUPlRrmt', title: 'Eko and Miya wink', topic: 'wink' },
    words: ['prank', 'plot', 'hoax'],
    captions: [
      [null, 'WHAT {word}?'],
      ['WHEN THEY ASK IF YOU KNOW ANYTHING', 'I KNOW NOTHING ABOUT THE {word}'],
    ],
  },
  thumb: {
    gif: { id: 'rxVCvZvrxqnJFBdVe5', title: 'Brent Rambo thumbs up', topic: 'thumbs-up' },
    words: ['approved', 'acceptable', 'admirable'],
    captions: [
      [null, 'CERTIFIED {word}'],
      ['WHEN THE GROUP FINALLY AGREES', 'THE OFFICIAL VERDICT IS {word}'],
    ],
  },
  peace: {
    gif: { id: 'nFFguNjdeotwc', title: 'Amy Poehler says peace out', topic: 'peace-out' },
    words: ['adios', 'so long', 'later', 'bye-bye'],
    captions: [
      [null, '{word}, EVERYONE'],
      ['WHEN THE CLOCK HITS FIVE', '{word}. I’M OUT.'],
    ],
  },
  palm: {
    gif: { id: '26FL8soUxrZBtpASQ', title: 'Fergie says hold up', topic: 'hold-up' },
    words: ['break', 'delay', 'hiatus', 'intermission'],
    captions: [
      [null, 'UNSCHEDULED {word}'],
      ['WHEN SOMEBODY SAYS “ONE MORE THING”', 'TIME FOR A BRIEF {word}'],
    ],
  },
  fist: {
    gif: { id: '7zczkZlKRJUr7s52ZX', title: 'Power Up by TrueMose', topic: 'power-up' },
    words: ['stamina', 'vigor', 'force', 'intensity'],
    captions: [
      [null, 'MAXIMUM {word} UNLOCKED'],
      ['WHEN THE FINAL ROUND STARTS', '{word} LEVELS RISING'],
    ],
  },
};

export function pickReactionCaption(reaction, excluded) {
  const { words, captions } = reactionContent[reaction.id];
  const choices = captions.flatMap(([top, bottom]) => (
    words.map((word) => ({ top: top ?? reaction.top, bottom: bottom.replace('{word}', word.toUpperCase()) }))
  )).filter(({ top, bottom }) => !excluded.some((pair) => top === pair?.top && bottom === pair?.bottom));
  return choices[Math.floor(Math.random() * choices.length)];
}
