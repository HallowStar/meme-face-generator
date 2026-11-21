const TAU = Math.PI * 2;
const rainbow = ['#ff5e87', '#ff9c56', '#ffe66f', '#7debc3', '#84d7ff', '#a785ff'];

function sourceSize(source) {
  return [source.videoWidth || source.naturalWidth || source.width, source.videoHeight || source.naturalHeight || source.height];
}

export function drawCover(ctx, source, width, height, focus = [0.5, 0.5]) {
  const [sourceWidth, sourceHeight] = sourceSize(source);
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const w = sourceWidth * scale;
  const h = sourceHeight * scale;
  ctx.drawImage(source, (width - w) * focus[0], (height - h) * focus[1], w, h);
}

function pointOnCover(point, source, width, height) {
  if (!point || !source) return [width * 0.5, height * 0.45];
  const [sourceWidth, sourceHeight] = sourceSize(source);
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  return [
    Math.max(width * 0.15, Math.min(width * 0.85, (width - sourceWidth * scale) / 2 + point.x * sourceWidth * scale)),
    Math.max(height * 0.13, Math.min(height * 0.79, (height - sourceHeight * scale) / 2 + point.y * sourceHeight * scale)),
  ];
}

export function captureStill(video) {
  if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;
  const frame = document.createElement('canvas');
  const scale = Math.min(1, 1080 / Math.max(video.videoWidth, video.videoHeight));
  frame.width = Math.round(video.videoWidth * scale);
  frame.height = Math.round(video.videoHeight * scale);
  const ctx = frame.getContext('2d');
  ctx.translate(frame.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, frame.width, frame.height);
  return frame;
}

function star(ctx, x, y, outer, inner, points, color, rotation = 0) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = i / (points * 2) * TAU + rotation;
    const radius = i % 2 ? inner : outer;
    ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
}

function ring(ctx, radius, color, width = 0.035, y = 0, flatten = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.ellipse(0, y, radius, radius * flatten, 0, 0, TAU);
  ctx.stroke();
}

function particles(ctx, p, count, draw) {
  for (let i = 0; i < count; i++) {
    const angle = i / count * TAU + Math.sin(i * 17) * 0.14;
    const spread = 0.34 + p * (0.65 + (i % 7) * 0.13) + (i % 3) * 0.18;
    draw(Math.cos(angle) * spread, Math.sin(angle) * spread, i, angle);
  }
}

function paintEffect(ctx, reaction, x, y, size, progress, opacity) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.globalAlpha = opacity;
  switch (reaction.id) {
    case 'shock': {
      const radius = 0.30 + Math.min(progress * 2, 1) * 0.59;
      ctx.save();
      ctx.globalAlpha *= 0.70;
      star(ctx, 0, 0, radius, radius * 0.53, 12, '#ff593d', 0.16);
      star(ctx, 0, 0, radius * 0.74, radius * 0.36, 10, '#ffb44f', 0.02);
      star(ctx, 0, 0, radius * 0.47, radius * 0.24, 8, '#fff3a2', 0.13);
      ctx.restore();
      ring(ctx, 0.37 + progress * 1.03, '#ffce79', 0.027);
      particles(ctx, progress, 24, (x, y, i, angle) => {
        star(ctx, x, y, 0.031 + i % 4 * 0.019, 0.022, 4, i % 2 ? '#ffe08a' : '#ff704b', angle);
      });
      break;
    }
    case 'smile':
      particles(ctx, progress, 54, (x, y, i, angle) => {
        ctx.save();
        ctx.translate(x * 1.22, y + progress * 0.42);
        ctx.rotate(angle + progress * 4);
        ctx.fillStyle = rainbow[i % rainbow.length];
        ctx.fillRect(-0.044, -0.025, 0.085, 0.042 + (i % 4) * 0.015);
        ctx.restore();
      });
      break;
    case 'wink':
      particles(ctx, progress, 11, (x, y, i, angle) => {
        star(ctx, x, y, 0.083 + i % 3 * 0.053, 0.032, 4, i % 3 ? '#f5c2ff' : '#fff5b1', angle);
      });
      star(ctx, 0.18, -0.22, 0.22, 0.05, 4, '#fff5e0');
      break;
    case 'thumb':
      ctx.rotate(-0.20);
      ctx.strokeStyle = '#69f9b3';
      ctx.lineWidth = 0.045;
      ctx.strokeRect(-0.72, -0.25, 1.44, 0.50);
      ctx.strokeRect(-0.66, -0.19, 1.32, 0.38);
      ctx.beginPath();
      ctx.moveTo(-0.22, 0.01);
      ctx.lineTo(-0.07, 0.13);
      ctx.lineTo(0.25, -0.12);
      ctx.stroke();
      break;
    case 'peace':
      rainbow.forEach((color, i) => {
        ctx.lineWidth = 0.044;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(-1.12, 0.49 + i * 0.055);
        ctx.bezierCurveTo(-0.53, 0.92 + i * 0.055, 0.35, -0.48 + i * 0.055, 0.94 + progress * 0.25, -0.59 + i * 0.055);
        ctx.stroke();
      });
      break;
    case 'palm':
      ctx.strokeStyle = '#9ceeff';
      ctx.lineWidth = 0.032;
      ctx.setLineDash([0.24, 0.073]);
      ctx.strokeRect(-0.84, -0.66, 1.68, 1.32);
      ctx.setLineDash([]);
      ctx.fillStyle = '#c0f4ff';
      ctx.fillRect(-0.105, -0.14, 0.075, 0.28);
      ctx.fillRect(0.03, -0.14, 0.075, 0.28);
      break;
    case 'fist':
      for (let i = 0; i < 4; i++) {
        ring(ctx, 0.31 + i * 0.19 + progress * 0.38, i % 2 ? '#b99bff' : '#87eeff', 0.021, i * 0.05, 0.74);
      }
      particles(ctx, progress, 16, (x, y, i, angle) => {
        star(ctx, x, y, 0.046 + i % 3 * 0.018, 0.012, 4, '#d5c8ff', angle);
      });
      break;
  }
  ctx.restore();
}

export function renderLive(canvas, reaction, still, point, progress) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  if (!reaction) return;
  if (reaction.id === 'palm' && still) {
    drawCover(ctx, still, width, height);
    ctx.fillStyle = '#202a5070';
    ctx.fillRect(0, 0, width, height);
  }
  const [x, y] = pointOnCover(point, still, width, height);
  const opacity = Math.min(1, (1 - progress) * 2.5);
  paintEffect(ctx, reaction, x, y, Math.min(width, height) * 0.32, progress, opacity);
}

function drawBackdrop(ctx, width, height, reaction) {
  const gradient = ctx.createRadialGradient(width * 0.48, height * 0.45, 25, width * 0.48, height * 0.45, height * 0.68);
  gradient.addColorStop(0, '#6331b5');
  gradient.addColorStop(1, '#211239');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#d8c7ff43';
  for (let y = 18; y < height; y += 29) {
    for (let x = 18; x < width; x += 29) {
      ctx.beginPath();
      ctx.arc(x, y, 2.3, 0, TAU);
      ctx.fill();
    }
  }
  if (reaction) {
    ctx.font = '260px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(reaction.icon, width * 0.5, height * 0.51);
  }
}

function wrapText(ctx, value, width) {
  const lines = [];
  let line = '';
  for (const word of value.trim().split(/\s+/)) {
    const next = line ? line + ' ' + word : word;
    if (ctx.measureText(next).width <= width) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    line = '';
    for (const character of word) {
      if (line && ctx.measureText(line + character).width > width) {
        lines.push(line);
        line = '';
      }
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function setCaption(ctx, value, maxSize, family, width, maxLines) {
  let size = maxSize;
  let lines;
  do {
    ctx.font = size + 'px ' + family;
    lines = wrapText(ctx, value, width);
    if (lines.length <= maxLines || size <= 20) break;
    size -= 4;
  } while (true);
  return { lines, size, leading: Math.round(size * 1.10) };
}

function outlineCaption(ctx, value, x, y, options = {}) {
  const {
    bottom = false, color = '#fff', maxSize = 94,
    width = 992, family = '"Archivo Black", Impact, sans-serif', align = 'center',
  } = options;
  const { lines, size, leading } = setCaption(ctx, value, maxSize, family, width, 3);
  ctx.textBaseline = 'top';
  ctx.textAlign = align;
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(5, size * 0.12);
  ctx.strokeStyle = '#211a24';
  ctx.fillStyle = color;
  const top = bottom ? y - lines.length * leading : y;
  lines.forEach((line, i) => {
    const baseline = top + i * leading;
    ctx.strokeText(line, x, baseline);
    ctx.fillText(line, x, baseline);
  });
}

export function renderMeme(canvas, draft, layout, topCaption, bottomCaption) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.save();
  ctx.textBaseline = 'top';
  const source = draft.frame || draft.image;
  if (source) {
    ctx.fillStyle = '#211239';
    ctx.fillRect(0, 0, width, height);
    drawCover(ctx, source, width, height, draft.template?.focus);
  } else {
    drawBackdrop(ctx, width, height, draft.reaction);
  }

  if (draft.reaction) {
    const [x, y] = pointOnCover(draft.point, source, width, height);
    paintEffect(ctx, draft.reaction, x, y, width * 0.27, 0.46, source ? 0.64 : 0.8);
  }

  const credit = draft.template?.credit;
  const license = draft.template?.license;
  const creditHeight = license ? 58 : credit ? 40 : 0;
  if (layout === 'doge') {
    const settings = { family: '"Comic Sans MS", "Space Grotesk", sans-serif', width: 754, maxSize: 88 };
    outlineCaption(ctx, topCaption, 60, 86, { ...settings, color: '#fff06a', align: 'left' });
    outlineCaption(ctx, bottomCaption, width - 60, height - 94 - creditHeight, { ...settings, color: '#ff91e3', align: 'right', bottom: true });
  } else if (layout === 'pov') {
    if (topCaption.trim()) {
      const text = /^POV\b/i.test(topCaption.trim()) ? topCaption : 'POV: ' + topCaption;
      const { lines, leading } = setCaption(ctx, text, 71, '"Archivo Black", sans-serif', width - 76, 3);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, 40 + lines.length * leading);
      ctx.fillStyle = '#221831';
      ctx.textAlign = 'center';
      lines.forEach((line, i) => ctx.fillText(line, width / 2, 23 + leading * i));
    }
    outlineCaption(ctx, bottomCaption.toUpperCase(), width / 2, height - 29 - creditHeight, { bottom: true });
  } else {
    outlineCaption(ctx, topCaption.toUpperCase(), width / 2, 33);
    outlineCaption(ctx, bottomCaption.toUpperCase(), width / 2, height - 25 - creditHeight, { bottom: true });
  }

  if (credit) {
    ctx.fillStyle = '#171020';
    ctx.fillRect(0, height - creditHeight, width, creditHeight);
    ctx.fillStyle = '#fff';
    ctx.font = '22px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(credit, width / 2, height - creditHeight + 17);
    if (license) {
      ctx.font = '19px "Space Grotesk", sans-serif';
      ctx.fillText(license.replace('https://', ''), width / 2, height - 15);
    }
  }
  ctx.restore();
}

export function createSoundEffects() {
  let audio;
  let volume;
  let enabled = true;

  function unlock() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio || !enabled) return Promise.resolve();
    try {
      if (!audio) {
        audio = new Audio();
        volume = audio.createGain();
        volume.gain.value = 0.58;
        volume.connect(audio.destination);
      }
      if (audio.state !== 'running') return audio.resume().catch(() => {});
    } catch {
      // Effects still render if the browser cannot start audio.
    }
    return Promise.resolve();
  }

  function setEnabled(value) {
    enabled = value;
    if (volume) volume.gain.setTargetAtTime(value ? 0.58 : 0, audio.currentTime, 0.015);
    if (value) void unlock();
  }

  function tone(at, frequency, end, length, type, gain) {
    const osc = audio.createOscillator();
    const envelope = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, at);
    osc.frequency.exponentialRampToValueAtTime(end, at + length);
    envelope.gain.setValueAtTime(0.001, at);
    envelope.gain.exponentialRampToValueAtTime(gain, at + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.001, at + length);
    osc.connect(envelope).connect(volume);
    osc.start(at);
    osc.stop(at + length);
  }

  function noise(at, length, from, to, gain) {
    const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * length), audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const burst = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const envelope = audio.createGain();
    burst.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(from, at);
    filter.frequency.exponentialRampToValueAtTime(to, at + length);
    envelope.gain.setValueAtTime(gain, at);
    envelope.gain.exponentialRampToValueAtTime(0.001, at + length);
    burst.connect(filter).connect(envelope).connect(volume);
    burst.start(at);
  }

  function play(id) {
    if (!enabled || audio?.state !== 'running') return;
    const at = audio.currentTime + 0.005;
    switch (id) {
      case 'shock':
        tone(at, 110, 39, 0.54, 'sine', 0.72);
        tone(at, 138, 56, 0.34, 'triangle', 0.25);
        noise(at, 0.44, 1400, 130, 0.35);
        break;
      case 'smile':
        [523, 659, 784, 1047].forEach((hz, i) => tone(at + i * 0.065, hz, hz, 0.25, 'sine', 0.24));
        break;
      case 'wink':
        tone(at, 420, 980, 0.14, 'sine', 0.33);
        noise(at, 0.10, 1900, 650, 0.1);
        break;
      case 'thumb':
        tone(at, 880, 880, 0.37, 'sine', 0.35);
        tone(at, 1320, 1320, 0.25, 'sine', 0.15);
        break;
      case 'peace':
        tone(at, 440, 660, 0.12, 'square', 0.12);
        tone(at + 0.12, 660, 990, 0.19, 'triangle', 0.27);
        break;
      case 'palm':
        noise(at, 0.35, 4300, 170, 0.48);
        tone(at, 290, 49, 0.30, 'sawtooth', 0.18);
        break;
      case 'fist':
        tone(at, 90, 380, 0.55, 'sawtooth', 0.15);
        tone(at, 120, 870, 0.58, 'triangle', 0.19);
        break;
    }
  }

  return { unlock, setEnabled, play };
}
