import { reactions, templates } from './presets.mjs?v=editorial';
import { captureStill, createSoundEffects, renderLive, renderMeme } from './effects.mjs?v=editorial';
import { startTracking } from './vision.mjs';
import { pickReactionCaption, reactionContent } from './reaction-content.mjs';

const byId = (id) => document.getElementById(id);
const video = byId('camera');
const stage = byId('stage');
const liveCanvas = byId('live-effects');
const memeCanvas = byId('meme');
const startButton = byId('start-camera');
const stopButton = byId('stop-camera');
const expandButton = byId('expand-camera');
const demoButton = byId('demo');
const downloadButton = byId('download');
const newCaptionButton = byId('new-caption');
const topCaption = byId('top-caption');
const bottomCaption = byId('bottom-caption');
const layout = byId('layout');
const upload = byId('upload');
const soundButton = byId('sound-toggle');
const sound = createSoundEffects();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const viralPlayer = byId('viral-player');
const gifPlayback = byId('gif-playback');
const reactionsById = new Map(reactions.map((reaction) => [reaction.id, reaction]));
const labels = {
  off: 'Camera off', starting: 'Waiting for camera', loading: 'Loading tracking',
  on: 'Camera live', error: 'Camera unavailable',
};
const templateButtons = new Map();
const lastCaptions = new Map();
const gifPositions = new Map();
let draft = { label: 'Choose a template or try an effect' };
let draftRequest = 0;
let activeGif;
let playGif = !reduceMotion.matches;
let currentEffect;
let animationFrame;
let effectTimer;
let stopTracking;

function appendText(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function announce(text) {
  byId('announcement').textContent = text;
}

function notify(text) {
  const notice = byId('notice');
  notice.textContent = text;
  notice.hidden = !text;
}

function renderDraft() {
  renderMeme(memeCanvas, draft, layout.value, topCaption.value, bottomCaption.value);
  const text = [draft.label, topCaption.value, bottomCaption.value].filter(Boolean);
  memeCanvas.setAttribute('aria-label', text.join('. '));
}

function setDraft(next, top = '', bottom = '', style) {
  draft = next;
  byId('draft-label').textContent = draft.label;
  for (const [id, button] of templateButtons) {
    button.setAttribute('aria-pressed', String(id === draft.template?.id));
  }
  topCaption.value = top;
  bottomCaption.value = bottom;
  if (style) layout.value = style;
  renderDraft();
  newCaptionButton.hidden = !draft.reaction;
  downloadButton.disabled = false;
}

function generateCaptions(reaction, current) {
  const next = pickReactionCaption(reaction, [lastCaptions.get(reaction.id), current]);
  lastCaptions.set(reaction.id, next);
  return next;
}

function updateGifPlayback() {
  if (!activeGif) return;
  if (playGif) {
    const url = 'https://giphy.com/embed/' + activeGif.id;
    if (viralPlayer.getAttribute('src') !== url) viralPlayer.src = url;
  } else {
    viralPlayer.removeAttribute('src');
  }
  viralPlayer.hidden = !playGif;
  byId('viral-placeholder').hidden = playGif;
  gifPlayback.textContent = playGif ? 'Pause GIF' : 'Play GIF';
}

function showViralMatch(reaction) {
  const { gifs, topic } = reactionContent[reaction.id];
  const position = gifPositions.get(reaction.id) ?? 0;
  activeGif = gifs[position];
  gifPositions.set(reaction.id, (position + 1) % gifs.length);
  if (reduceMotion.matches) playGif = false;
  byId('viral-name').textContent = activeGif.title;
  byId('viral-source').href = 'https://giphy.com/gifs/' + activeGif.id;
  byId('viral-more').href = 'https://giphy.com/explore/' + topic;
  viralPlayer.title = activeGif.title + ' GIF on GIPHY';
  updateGifPlayback();
  byId('viral-screen').hidden = false;
  byId('viral-links').hidden = false;
  const gifDemo = byId('gif-demo');
  const moveFocus = document.activeElement === gifDemo;
  gifDemo.hidden = true;
  if (moveFocus) gifPlayback.focus({ preventScroll: true });
}

function loadImage(url) {
  const image = new Image();
  image.src = url;
  return image.decode().then(() => image);
}

async function chooseTemplate(template, isInitial = false) {
  const request = ++draftRequest;
  try {
    const image = await loadImage(template.image);
    if (request !== draftRequest) return;
    setDraft({ template, image, label: template.name + ' template' }, template.top, template.bottom, template.layout);
    if (!isInitial) {
      notify('');
      announce(template.name + ' is ready in the meme editor.');
      showEditor();
    }
  } catch {
    if (request === draftRequest) notify('The template image could not load. Try another template or effect.');
  }
}

function showEditor() {
  const editor = byId('editor-title');
  const bounds = editor.getBoundingClientRect();
  if (bounds.top < 0 || bounds.bottom > window.innerHeight) {
    editor.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  }
}

function clearLiveEffect() {
  cancelAnimationFrame(animationFrame);
  clearTimeout(effectTimer);
  currentEffect = null;
  byId('effect-caption').hidden = true;
  renderLive(liveCanvas, null);
}

function drawLiveEffect(reaction, still, point, progress) {
  const density = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(stage.clientWidth * density));
  const height = Math.max(1, Math.round(stage.clientHeight * density));
  if (liveCanvas.width !== width || liveCanvas.height !== height) {
    liveCanvas.width = width;
    liveCanvas.height = height;
  }
  renderLive(liveCanvas, reaction, still, point, progress);
}

function fireReaction(reaction, position, manual = false) {
  clearLiveEffect();
  ++draftRequest;

  const frame = video.hidden ? null : captureStill(video);
  const point = position ? { x: 1 - position.x, y: position.y } : undefined;
  const action = { reaction, frame, point, label: reaction.name + ' reaction' };
  const captions = generateCaptions(reaction);
  currentEffect = action;
  setDraft(action, captions.top, captions.bottom);
  showViralMatch(reaction);
  announce(reaction.name + ' effect. A new meme and viral match are ready.');

  const caption = byId('effect-caption');
  caption.textContent = reaction.title;
  caption.style.setProperty('--effect-color', reaction.accent);
  caption.hidden = false;

  if (manual) {
    void sound.unlock().then(() => {
      if (currentEffect === action) sound.play(reaction.id);
    });
  } else {
    sound.play(reaction.id);
  }

  if (reduceMotion.matches) {
    drawLiveEffect(reaction, frame, point, 0.42);
    effectTimer = window.setTimeout(clearLiveEffect, 970);
    return;
  }

  const start = performance.now();
  const duration = reaction.id === 'palm' ? 900 : 1120;
  function animate(now) {
    const progress = (now - start) / duration;
    if (progress >= 1) {
      clearLiveEffect();
      return;
    }
    drawLiveEffect(reaction, frame, point, Math.max(0, progress));
    animationFrame = requestAnimationFrame(animate);
  }
  animationFrame = requestAnimationFrame(animate);
}

function updateTracker(id, type, text, active = false) {
  const tracker = byId(id);
  const label = type + ' ' + text;
  if (tracker.textContent !== label) tracker.textContent = label;
  tracker.dataset.active = String(active);
}

function setCameraState(state, message = '') {
  const status = byId('camera-status');
  status.dataset.state = state;
  status.lastElementChild.textContent = labels[state];
  stage.dataset.camera = state;
  video.hidden = !['loading', 'on'].includes(state);
  byId('camera-prompt').hidden = state === 'on';
  startButton.hidden = !['off', 'error'].includes(state);
  startButton.textContent = state === 'error' ? 'Retry camera' : 'Start camera';
  stopButton.hidden = !['starting', 'loading', 'on'].includes(state);
  byId('local-label').hidden = !stopButton.hidden;

  if (state !== 'on') {
    const text = state === 'loading' ? 'loading' : 'idle';
    updateTracker('face-status', 'Face', text);
    updateTracker('hand-status', 'Hand', text);
  }
  byId('stage-title').textContent = {
    off: 'Ready when you are',
    starting: 'Waiting for permission',
    loading: 'Warming up the camera',
    error: 'Camera takes a break',
  }[state] || '';
  byId('stage-description').textContent = message || 'Turn on your camera to react live.';
  if (state !== 'error') announce(labels[state]);
  if (state === 'error') announce(message);
  notify(state === 'on' ? message : '');
}

function trackFrame(sample) {
  for (const [key, type] of [['face', 'Face'], ['hand', 'Hand']]) {
    const id = sample[key + 'Id'];
    const matched = reactionsById.get(id)?.name.toLowerCase();
    const seen = sample[key + 'Seen'];
    const available = sample[key + 'Available'];
    let text = available ? 'searching' : 'unavailable';
    if (seen) text = matched ? '· ' + matched : 'detected';
    updateTracker(key + '-status', type, text, seen);
  }
  if (sample.active) fireReaction(reactionsById.get(sample.active), sample.point);
}

function stopCamera() {
  stopTracking?.();
  stopTracking = undefined;
  clearLiveEffect();
  setCameraState('off');
}

startButton.addEventListener('click', () => {
  void sound.unlock();
  const restoreFocus = document.activeElement === startButton;
  setCameraState('starting', 'Allow webcam access in your browser to start tracking.');
  stopTracking = startTracking(video, {
    state(state, message) {
      const restoreFocus = state === 'error' && document.activeElement === stopButton;
      setCameraState(state, message);
      if (restoreFocus) startButton.focus({ preventScroll: true });
    },
    sample: trackFrame,
  });
  if (restoreFocus) {
    const target = stopButton.hidden ? startButton : stopButton;
    target.focus({ preventScroll: true });
  }
});

stopButton.addEventListener('click', () => {
  stopCamera();
  startButton.focus({ preventScroll: true });
});

const studioGrid = byId('studio-grid');

function setCameraView(expanded) {
  document.body.classList.toggle('camera-view', expanded);
  expandButton.textContent = expanded ? 'Exit camera view' : 'Expand camera';
}

function exitCameraView() {
  setCameraView(false);
  if (document.fullscreenElement === studioGrid) void document.exitFullscreen().catch(() => {});
  expandButton.focus({ preventScroll: true });
}

expandButton.addEventListener('click', () => {
  if (document.body.classList.contains('camera-view')) {
    exitCameraView();
    return;
  }
  setCameraView(true);
  if (document.fullscreenEnabled) void studioGrid.requestFullscreen().catch(() => {});
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && document.body.classList.contains('camera-view')) exitCameraView();
});

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || event.defaultPrevented || !document.body.classList.contains('camera-view')) return;
  exitCameraView();
});

for (const button of [demoButton, byId('gif-demo')]) {
  button.addEventListener('click', () => fireReaction(reactionsById.get('shock'), undefined, true));
}
window.addEventListener('pagehide', stopCamera);

soundButton.addEventListener('click', () => {
  const enabled = soundButton.getAttribute('aria-pressed') === 'false';
  soundButton.setAttribute('aria-pressed', String(enabled));
  byId('sound-label').textContent = enabled ? 'Sound on' : 'Sound off';
  byId('sound-icon').textContent = enabled ? '♪' : '×';
  sound.setEnabled(enabled);
});

const effectGrid = byId('effect-grid');
for (const reaction of reactions) {
  const button = appendText(effectGrid, 'button', 'effect-card', '');
  button.type = 'button';
  button.dataset.color = reaction.color;
  button.dataset.source = reaction.source;
  button.setAttribute('aria-label', 'Try ' + reaction.name);
  const icon = appendText(button, 'span', 'effect-icon', '');
  icon.setAttribute('aria-hidden', 'true');
  appendText(button, 'span', 'effect-name', reaction.name);
  const pose = appendText(button, 'span', 'effect-pose', reaction.pose);
  const kind = appendText(button, 'span', 'effect-kind', reaction.effect + ' · ' + reaction.sound);
  pose.id = reaction.id + '-pose';
  kind.id = reaction.id + '-effects';
  button.setAttribute('aria-describedby', pose.id + ' ' + kind.id);
  button.addEventListener('click', () => {
    fireReaction(reaction, undefined, true);
    const bounds = stage.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) {
      stage.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    }
  });
}

for (const button of document.querySelectorAll('[data-filter]')) {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    for (const other of document.querySelectorAll('[data-filter]')) {
      other.setAttribute('aria-pressed', String(button === other));
    }
    for (const card of effectGrid.children) {
      card.hidden = filter !== 'all' && card.dataset.source !== filter;
    }
  });
}

const templateGrid = byId('template-grid');
for (const template of templates) {
  const card = appendText(templateGrid, 'article', 'template-card', '');
  const button = appendText(card, 'button', 'template-select', '');
  button.type = 'button';
  button.setAttribute('aria-pressed', 'false');
  const image = document.createElement('img');
  image.src = template.image;
  image.alt = '';
  image.loading = 'lazy';
  image.style.objectPosition = template.focus.map((value) => value * 100 + '%').join(' ');
  button.append(image);
  appendText(button, 'span', 'template-name', template.name);
  button.addEventListener('click', () => void chooseTemplate(template));
  templateButtons.set(template.id, button);

  const credits = appendText(card, 'p', 'template-credit', '');
  appendText(credits, 'a', '', template.credit).href = template.source;
  if (template.license) {
    credits.append(' · ');
    appendText(credits, 'a', '', 'License').href = template.license;
  }
}

const templateStack = byId('template-stack');
const stackImages = templates.map((template) => {
  const image = document.createElement('img');
  image.src = template.image;
  image.alt = '';
  image.loading = 'lazy';
  image.style.objectPosition = template.focus.map((value) => value * 100 + '%').join(' ');
  templateStack.append(image);
  return image;
});
let featuredIndex = 0;

function showFeaturedTemplate(offset) {
  featuredIndex = (featuredIndex + offset + templates.length) % templates.length;
  const template = templates[featuredIndex];
  byId('featured-template-name').textContent = template.name;
  byId('featured-template-caption').textContent = template.top + ' / ' + template.bottom;
  stackImages.forEach((image, index) => {
    image.dataset.depth = String((index - featuredIndex + templates.length) % templates.length);
  });
}

byId('previous-template').addEventListener('click', () => showFeaturedTemplate(-1));
byId('next-template').addEventListener('click', () => showFeaturedTemplate(1));
byId('apply-featured-template').addEventListener('click', () => void chooseTemplate(templates[featuredIndex]));
showFeaturedTemplate(0);

byId('upload-button').addEventListener('click', () => upload.click());

upload.addEventListener('change', async () => {
  const file = upload.files[0];
  upload.value = '';
  if (!file) return;
  const request = ++draftRequest;
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    if (request !== draftRequest) return;
    setDraft({ image, label: 'Your image' }, '', '', 'classic');
    notify('');
    announce('Your image is ready in the meme editor.');
    showEditor();
  } catch {
    if (request === draftRequest) notify('This image could not open. Try a JPEG, PNG, or WebP file.');
  } finally {
    URL.revokeObjectURL(url);
  }
});

[topCaption, bottomCaption].forEach((field) => field.addEventListener('input', renderDraft));
layout.addEventListener('change', renderDraft);

newCaptionButton.addEventListener('click', () => {
  if (!draft.reaction) return;
  const captions = generateCaptions(draft.reaction, { top: topCaption.value, bottom: bottomCaption.value });
  topCaption.value = captions.top;
  bottomCaption.value = captions.bottom;
  renderDraft();
  announce('New caption is ready in the editor.');
});

gifPlayback.addEventListener('click', () => {
  playGif = !playGif;
  updateGifPlayback();
});

reduceMotion.addEventListener('change', () => {
  playGif = !reduceMotion.matches;
  updateGifPlayback();
});

downloadButton.addEventListener('click', () => {
  const name = draft.reaction?.id || draft.template?.id || 'custom';
  memeCanvas.toBlob((blob) => {
    if (!blob) {
      notify('The PNG could not be created. Try downloading again.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meme-cam-' + name + '.png';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    announce('PNG downloaded.');
  }, 'image/png');
});

renderDraft();
void chooseTemplate(templates[0], true);
void Promise.all([
  document.fonts.load('20px "Archivo Black"'),
  document.fonts.load('20px "Space Grotesk"'),
]).then(renderDraft).catch(() => {});
