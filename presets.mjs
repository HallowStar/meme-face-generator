export const reactions = [
  { id: 'shock', source: 'face', name: 'Shock', color: 'peach', accent: '#ff773c', title: 'EXCUSE ME?!', top: 'WHEN YOU SEE THE GROUP CHAT', pose: 'Open your mouth wide and raise your brows.', effect: 'Explosion', sound: 'Bass boom' },
  { id: 'smile', source: 'face', name: 'Big smile', color: 'yellow', accent: '#ffce4d', title: 'I CALL THAT A WIN', top: 'WHEN IT WORKS ON THE FIRST TRY', pose: 'Hold a wide smile.', effect: 'Confetti', sound: 'Chime' },
  { id: 'wink', source: 'face', name: 'Wink', color: 'lilac', accent: '#b786ff', title: 'YOU SAW NOTHING', top: 'WHEN NOBODY NOTICED', pose: 'Close one eye and keep the other open.', effect: 'Sparkle', sound: 'Pop' },
  { id: 'thumb', source: 'hand', name: 'Thumbs up', color: 'mint', accent: '#65f5af', title: 'APPROVED', top: 'THE COUNCIL HAS SPOKEN', pose: 'Hold a thumbs-up toward the camera.', effect: 'Stamp', sound: 'Ding' },
  { id: 'peace', source: 'hand', name: 'Peace sign', color: 'pink', accent: '#ff79c3', title: 'PEACE OUT', top: 'ME LEAVING THE MEETING', pose: 'Hold two fingers up in a V.', effect: 'Rainbow trail', sound: 'Arcade blip' },
  { id: 'palm', source: 'hand', name: 'Open palm', color: 'blue', accent: '#7ee2ff', title: 'HOLD UP', top: 'WHEN THE MATH ISN’T MATHING', pose: 'Face your open palm toward the camera.', effect: 'Freeze-frame', sound: 'Record scratch' },
  { id: 'fist', source: 'hand', name: 'Closed fist', color: 'lilac', accent: '#a67bff', title: 'POWERING UP', top: 'ME AFTER ONE SIP OF COFFEE', pose: 'Hold a closed fist in frame.', effect: 'Energy rings', sound: 'Rising synth' },
];

export const templates = [
  {
    id: 'grumpy-cat', name: 'Grumpy Cat', image: './assets/grumpy-cat.jpg',
    top: 'WHEN THEY SAY “QUICK CALL”', bottom: 'AND OPEN A SLIDE DECK', layout: 'classic',
    credit: 'Photo: Gage Skidmore · cropped/captioned · CC BY-SA 3.0',
    source: 'https://commons.wikimedia.org/wiki/File:Grumpy_Cat_by_Gage_Skidmore.jpg',
    license: 'https://creativecommons.org/licenses/by-sa/3.0/',
    focus: [0.5, 0.19],
  },
  {
    id: 'doge', name: 'Doge', image: './assets/doge.jpg',
    top: 'such reaction', bottom: 'very meme. wow.', layout: 'doge',
    credit: 'Taiki photo: Roberto Vasarri · Public domain',
    source: 'https://commons.wikimedia.org/wiki/File:Shiba_inu_taiki.jpg',
    focus: [0.5, 0.39],
  },
  {
    id: 'this-is-fine', name: 'This Is Fine', image: './assets/this-is-fine.jpg',
    top: 'POV: THE DEMO STARTS IN 5 MINUTES', bottom: 'THIS IS FINE', layout: 'pov',
    credit: 'Art: David Revoy · CC BY 4.0 · cropped/captioned',
    source: 'https://www.peppercarrot.com/en/viewer/misc__2025-07-01_This-is-fine_by-David-Revoy.html',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    focus: [0.51, 0.5],
  },
];
