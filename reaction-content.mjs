// Vocabulary reviewed from Datamuse's /words results for each reaction.
export const reactionContent = {
  shock: {
    topic: 'ishowspeed-shocked',
    gifs: [
      { id: '6tyvhr7zaoHOYuOtg7', title: 'iShowSpeed shocked' },
      { id: 'dQ2hNt4MVbguZ5yu4M', title: 'iShowSpeed in disbelief' },
      { id: 'RUciiUqoEqWaM3dBGP', title: 'iShowSpeed can’t believe it' },
    ],
    words: ['shock', 'amazement', 'astonishment'],
    captions: [
      [null, 'PURE {word}'],
      ['WHEN THE PLOT TWIST HAS A PLOT TWIST', '{word} LEVELS CRITICAL'],
    ],
  },
  smile: {
    topic: 'smiling-monkey',
    gifs: [
      { id: '9G50jwiTVJtUCZ83bW', title: 'Grinning monkey' },
      { id: 'dBIvrxdLuk9JrMeU9S', title: 'Smiling cartoon monkey' },
    ],
    words: ['victory', 'triumph', 'glory'],
    captions: [
      [null, 'SMELLS LIKE {word}'],
      ['WHEN THE PLAN ACTUALLY WORKS', '{word} MODE ACTIVATED'],
    ],
  },
  wink: {
    topic: 'wink',
    gifs: [
      { id: 'Xbz9rDFWrtyUPlRrmt', title: 'Eko and Miya wink' },
      { id: '26gYL9IGJiWMrcewU', title: 'Shalita Grant winks' },
    ],
    words: ['prank', 'plot', 'hoax'],
    captions: [
      [null, 'WHAT {word}?'],
      ['WHEN THEY ASK IF YOU KNOW ANYTHING', 'I KNOW NOTHING ABOUT THE {word}'],
    ],
  },
  thumb: {
    topic: 'thumbs-up',
    gifs: [
      { id: 'rxVCvZvrxqnJFBdVe5', title: 'Brent Rambo thumbs up' },
      { id: 'w832CKAADJut6lBEOE', title: 'Way to go thumbs-up' },
    ],
    words: ['approved', 'acceptable', 'admirable'],
    captions: [
      [null, 'CERTIFIED {word}'],
      ['WHEN THE GROUP FINALLY AGREES', 'THE OFFICIAL VERDICT IS {word}'],
    ],
  },
  peace: {
    topic: 'peace-out',
    gifs: [
      { id: 'nFFguNjdeotwc', title: 'Amy Poehler says peace out' },
      { id: 'qoesee6tcblyw', title: 'Napoleon Dynamite peace out' },
    ],
    words: ['adios', 'so long', 'later', 'bye-bye'],
    captions: [
      [null, '{word}, EVERYONE'],
      ['WHEN THE CLOCK HITS FIVE', '{word}. I’M OUT.'],
    ],
  },
  palm: {
    topic: 'hold-up',
    gifs: [
      { id: '26FL8soUxrZBtpASQ', title: 'Fergie says hold up' },
      { id: 'cWtkZ6aOHLIGwSCWIx', title: 'Wait a second' },
    ],
    words: ['break', 'delay', 'hiatus', 'intermission'],
    captions: [
      [null, 'UNSCHEDULED {word}'],
      ['WHEN SOMEBODY SAYS “ONE MORE THING”', 'TIME FOR A BRIEF {word}'],
    ],
  },
  fist: {
    topic: 'power-up',
    gifs: [
      { id: '7zczkZlKRJUr7s52ZX', title: 'Power Up by TrueMose' },
      { id: 'aHOU7Pg8VRpifMNOv2', title: 'Celebratory fist pump' },
    ],
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
