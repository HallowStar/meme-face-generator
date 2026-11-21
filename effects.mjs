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

function line(ctx, color, width, points) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  points.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.stroke();
}

function paintPack(ctx, effect, p) {
  const { id, accent } = effect;
  switch (id) {
    case 'genjutsu':
      for (let i = 0; i < 3; i++) {
        ctx.rotate(p * (i + 1) * 0.8);
        ctx.setLineDash([0.23, 0.07, 0.036, 0.09]);
        ring(ctx, 0.47 + i * 0.27 + p * 0.35, i % 2 ? '#a57dfa' : accent, 0.02);
      }
      ctx.setLineDash([]);
      particles(ctx, 1 - p, 22, (x, y, i, angle) => {
        star(ctx, x, y, 0.08 + i % 3 * 0.013, 0.025, 4, i % 2 ? accent : '#f86b99', angle);
      });
      break;
    case 'shadow-blink':
      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = i % 2 ? accent : '#825cd8';
        ctx.lineWidth = 0.018 + i * 0.005;
        ctx.beginPath();
        ctx.ellipse((i - 2.5) * (0.17 + p * 0.18), -i * 0.04, 0.39 + i * 0.09, 0.62, i * 0.26, 0.12, Math.PI * 1.6);
        ctx.stroke();
      }
      break;
    case 'rift':
      ctx.rotate(-0.32 + p * 1.2);
      for (let i = 0; i < 5; i++) {
        ctx.setLineDash([0.63, 0.12, 0.19, 0.19]);
        ctx.lineDashOffset = i * 0.3 + p * 2;
        ring(ctx, 0.24 + i * 0.24, i % 2 ? '#5dceff' : accent, 0.03, 0, 0.52);
      }
      ctx.setLineDash([]);
      particles(ctx, 1 - p, 22, (x, y) => line(ctx, accent, 0.023, [[x, y * 0.62], [x * 1.18, y * 0.75]]));
      break;
    case 'time-shatter':
    case 'thunder': {
      const lightning = id === 'thunder';
      const arms = lightning ? 6 : 9;
      for (let i = 0; i < arms; i++) {
        ctx.save();
        ctx.rotate(i / arms * TAU + i * 0.04);
        const length = (lightning ? 0.85 + p * 0.55 : 0.45 + Math.min(p * 4, 1) * 1.35) * (0.7 + i % 4 * 0.13);
        const points = [[0.16, 0], [length * 0.39, -0.09], [length * 0.53, 0.09], [length * 0.74, -0.065], [length, 0.1]];
        line(ctx, lightning ? '#8b5dea' : '#485682', lightning ? 0.066 : 0.035, points);
        line(ctx, accent, lightning ? 0.027 : 0.016, points);
        line(ctx, accent, 0.015, [points[2], [length * 0.67, 0.24], [length * 0.92, 0.33]]);
        ctx.restore();
      }
      if (lightning) ring(ctx, 0.31 + p * 0.31, accent, 0.033);
      break;
    }
    case 'comet': {
      const travel = Math.max(0, 1 - p / 0.44);
      if (travel > 0) {
        ctx.rotate(0.6);
        for (let i = 0; i < 7; i++) {
          line(ctx, i % 2 ? '#ff785a' : accent, 0.024 + i * 0.011, [[-2.6 * travel - 0.8 - i * 0.12, (i - 3) * 0.065], [-2.6 * travel, 0]]);
        }
        star(ctx, -2.6 * travel, 0, 0.27, 0.14, 7, '#fff0a1');
      } else {
        const impact = (p - 0.44) / 0.56;
        ring(ctx, 0.28 + impact * 1.54, accent, 0.056, 0.47, 0.42);
        particles(ctx, impact, 22, (x, y, i, angle) => {
          star(ctx, x, y * 0.75, 0.045 + i % 4 * 0.023, 0.021, 4, i % 2 ? '#ffe697' : '#ff7544', angle);
        });
      }
      break;
    }
    case 'retro-signal':
      for (let i = 0; i < 18; i++) {
        ctx.fillStyle = i % 3 ? accent : '#ff6da3';
        const drift = Math.sin(i * 39 + p * 12) * 0.34;
        ctx.fillRect(Math.cos(i * 54) * 1.05 + drift, (i - 9) * 0.12, 0.12 + i % 4 * 0.12, 0.012 + i % 3 * 0.014);
      }
      break;
    case 'pixel-warp':
      particles(ctx, p, 33, (x, y, i) => {
        const unit = 0.085;
        ctx.fillStyle = [accent, '#79caff', '#bfa9ff'][i % 3];
        ctx.fillRect(Math.round(x / unit) * unit, Math.round(y / unit) * unit, unit * (1 + i % 2), unit);
      });
      break;
    case 'bass-drop':
      ring(ctx, 0.51 + p * 0.66, '#cb9fff', 0.033);
      for (let i = 0; i < 42; i++) {
        const angle = i / 42 * TAU;
        const base = 0.62 + p * 0.29;
        const length = (0.16 + Math.abs(Math.sin(i * 5 + p * 23)) * 0.38) * (1 - p * 0.59);
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        line(ctx, i % 3 ? accent : '#ba97ff', 0.035, [[x * base, y * base], [x * (base + length), y * (base + length)]]);
      }
      break;
    case 'holo-scan': {
      const scan = -0.75 + p * 1.50;
      for (const x of [-1, 1]) {
        for (const y of [-1, 1]) {
          line(ctx, accent, 0.029, [[x * 0.98, y * 0.44], [x * 0.98, y * 0.73], [x * 0.7, y * 0.73]]);
        }
      }
      ctx.fillStyle = '#47e4f845';
      ctx.fillRect(-0.98, scan - 0.09, 1.96, 0.12);
      line(ctx, accent, 0.022, [[-1.09, scan], [1.09, scan]]);
      for (let i = -3; i <= 3; i++) ctx.fillRect(i * 0.23, scan - 0.075, 0.015, 0.055);
      star(ctx, 0, 0, 0.095, 0.026, 4, accent);
      break;
    }
    case 'heart-bloom':
      particles(ctx, p, 23, (x, y, i, angle) => {
        if (i % 3 === 0) {
          star(ctx, x, y - p * 0.44, 0.083, 0.023, 4, '#ffe7ae', angle);
          return;
        }
        ctx.save();
        ctx.translate(x, y - p * 0.65);
        ctx.rotate(Math.sin(i) * 0.4);
        const size = 0.11 + (i % 4) * 0.033;
        ctx.scale(size, size);
        ctx.fillStyle = i % 2 ? accent : '#ff6f9d';
        ctx.beginPath();
        ctx.moveTo(0, -0.2);
        ctx.bezierCurveTo(-1, -1.41, -1.83, 0.14, 0, 0.99);
        ctx.bezierCurveTo(1.83, 0.14, 1, -1.41, 0, -0.2);
        ctx.fill();
        ctx.restore();
      });
      break;
    case 'checkpoint':
      ctx.rotate(-0.15);
      ring(ctx, 0.48, accent, 0.041);
      ring(ctx, 0.57, '#ffecc3', 0.017);
      line(ctx, accent, 0.06, [[-0.24, 0.02], [-0.08, 0.18], [0.26, -0.17]]);
      particles(ctx, p, 18, (x, y, i, angle) => {
        star(ctx, x, y, 0.05 + i % 3 * 0.022, 0.029, 4, i % 2 ? accent : '#fff0b7', angle);
      });
      break;
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
    default:
      paintPack(ctx, reaction, progress);
  }
  ctx.restore();
}

function ease(from, to, value) {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

function orbPlacement(point, source, width, height) {
  const shortSide = Math.min(width, height);
  if (!point || !source) return [width / 2, height * 0.30, shortSide * 0.12];
  const [sourceWidth, sourceHeight] = sourceSize(source);
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawnWidth = sourceWidth * scale;
  const drawnHeight = sourceHeight * scale;
  const radius = Math.max(shortSide * 0.066, Math.min(shortSide * 0.19, (point.radius ?? 0.105) * drawnHeight));
  const x = (width - drawnWidth) / 2 + point.x * drawnWidth;
  const y = (height - drawnHeight) / 2 + point.y * drawnHeight - radius * 1.13;
  const margin = radius * 1.12;
  return [Math.max(margin, Math.min(width - margin, x)), Math.max(margin, Math.min(height - margin, y)), radius];
}

function paintOrb(ctx, x, y, radius, progress, opacity) {
  const charge = ease(0, 0.27, progress);
  const turn = progress * 8;
  const glow = 0.95 + Math.sin(turn * 2.3) * 0.05;
  const size = radius * (0.28 + charge * 0.72);
  ctx.save();
  ctx.translate(x, y + (1 - charge) * radius * 0.64);
  ctx.scale(size, size);
  ctx.globalAlpha = opacity * Math.min(1, 0.15 + charge * 1.1);

  const aura = ctx.createRadialGradient(0, 0, 0.35, 0, 0, 2.25);
  aura.addColorStop(0, '#4ef9fcad');
  aura.addColorStop(0.38, '#14a6fb95');
  aura.addColorStop(0.69, '#1060fd35');
  aura.addColorStop(1, '#0633ff00');
  ctx.fillStyle = aura;
  ctx.fillRect(-2.25, -2.25, 4.5, 4.5);

  const core = ctx.createRadialGradient(-0.2, -0.26, 0.02, 0, 0, 1);
  core.addColorStop(0, '#f0ffff');
  core.addColorStop(0.22, '#87fcff');
  core.addColorStop(0.54, '#10d8ff');
  core.addColorStop(0.84, '#086bd8');
  core.addColorStop(1, '#0554cf');
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.fillStyle = core;
  ctx.fill();

  ctx.save();
  ctx.clip();
  ctx.rotate(-0.39 + Math.sin(turn) * 0.28);
  ctx.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const y = -1 + ((turn * 0.25 + i * 0.21) % 2);
    const offset = Math.cos(i * 4 + turn) * 0.28;
    ctx.strokeStyle = i % 3 === 0 ? '#c5ffffe8' : i % 2 ? '#0877e4d1' : '#38f3ffc0';
    ctx.lineWidth = 0.035 + i % 3 * 0.036;
    ctx.beginPath();
    ctx.moveTo(-1.1 + offset, y + 0.18);
    ctx.bezierCurveTo(-0.39 + offset, y - 0.19, 0.44, y - 0.04, 1.03, y - 0.16);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.rotate(turn * 0.45);
  ctx.globalAlpha *= glow;
  ctx.setLineDash([1.62, 0.12, 0.51, 0.16, 0.27, 0.37]);
  ring(ctx, 1.02, '#3df9ff', 0.072);
  ctx.rotate(-0.53);
  ctx.setLineDash([0.86, 0.44, 0.28, 1.45]);
  ring(ctx, 1.28, '#68dfffbd', 0.028, 0, 0.88);
  ctx.restore();

  for (let i = 0; i < 14; i++) {
    const angle = i / 14 * TAU + turn * (i % 2 ? -0.59 : 0.62);
    const orbit = 1.14 + i % 5 * 0.14 + Math.sin(turn + i * 2.6) * 0.075;
    star(ctx, Math.cos(angle) * orbit, Math.sin(angle) * orbit, 0.037 + i % 3 * 0.014, 0.017, 4, i % 3 ? '#61f4ff' : '#e9ffff', angle);
  }
  ctx.restore();
}

let pixelFrame;

function transformCamera(ctx, id, still, width, height, p) {
  const wave = Math.sin(Math.PI * p);
  switch (id) {
    case 'genjutsu': {
      const dissolve = ease(0.12, 0.56, p) * (1 - ease(0.68, 1, p));
      ctx.globalAlpha = dissolve;
      ctx.fillStyle = '#1e102a';
      ctx.fillRect(0, 0, width, height);
      if (!still) break;
      // The original video keeps playing under the canvas. The held image shrinks
      // into a fading afterimage before the canvas hands back to the live feed.
      const scale = 1 - dissolve * 0.48;
      ctx.globalAlpha = dissolve * (1 - dissolve);
      ctx.translate(width * (1 - scale) / 2, height * (1 - scale) / 2);
      ctx.scale(scale, scale);
      drawCover(ctx, still, width, height);
      break;
    }
    case 'shadow-blink':
      ctx.globalAlpha = wave * 0.46;
      ctx.filter = 'hue-rotate(70deg) saturate(1.7)';
      ctx.translate(width * p * 0.22, -height * p * 0.10);
      drawCover(ctx, still, width, height);
      break;
    case 'time-shatter':
    case 'retro-signal': {
      const glitch = id === 'retro-signal';
      const shift = wave * (glitch ? 0.65 + 0.35 * Math.sin(p * 38) : 1);
      for (let i = 0; i < 7; i++) {
        const strip = height / 7;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, i * strip, width, strip + 1);
        ctx.clip();
        ctx.globalAlpha = wave * (glitch ? 0.76 : 1);
        ctx.translate(Math.sin(i * 31 + (glitch ? p * 14 : 0)) * width * shift * 0.12, 0);
        if (glitch && i % 2) ctx.filter = 'hue-rotate(100deg) saturate(2)';
        drawCover(ctx, still, width, height);
        ctx.restore();
      }
      break;
    }
    case 'pixel-warp':
      pixelFrame ??= document.createElement('canvas');
      pixelFrame.width = Math.round(30 + (1 - wave) * 185);
      pixelFrame.height = Math.max(1, Math.round(pixelFrame.width * height / width));
      drawCover(pixelFrame.getContext('2d'), still, pixelFrame.width, pixelFrame.height);
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = wave;
      ctx.drawImage(pixelFrame, 0, 0, width, height);
      break;
    case 'bass-drop': {
      const pulse = 1 + wave * (0.12 + 0.05 * Math.sin(p * 21));
      ctx.globalAlpha = wave * 0.8;
      ctx.translate(width * (1 - pulse) / 2, height * (1 - pulse) / 2);
      drawCover(ctx, still, width * pulse, height * pulse);
      break;
    }
  }
}

export function renderLive(canvas, reaction, still, point, progress, motion = true, opacity = Math.min(1, (1 - progress) * 2.5)) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  if (!reaction) return;
  if (reaction.id === 'energy-orb') {
    const [x, y, radius] = orbPlacement(point, still, width, height);
    paintOrb(ctx, x, y, radius, progress, opacity);
    return;
  }
  if (reaction.id === 'palm' && still) {
    drawCover(ctx, still, width, height);
    ctx.fillStyle = '#202a5070';
    ctx.fillRect(0, 0, width, height);
  } else if (motion && (still || reaction.id === 'genjutsu')) {
    ctx.save();
    transformCamera(ctx, reaction.id, still, width, height, progress);
    ctx.restore();
  }
  const [x, y] = pointOnCover(point, still, width, height);
  paintEffect(ctx, reaction, x, y, Math.min(width, height) * 0.32, progress, opacity);
}

function drawBackdrop(ctx, width, height) {
  const gradient = ctx.createRadialGradient(width * 0.48, height * 0.45, 25, width * 0.48, height * 0.45, height * 0.68);
  gradient.addColorStop(0, '#4a2920');
  gradient.addColorStop(1, '#1a1815');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#f6d8c043';
  for (let y = 18; y < height; y += 29) {
    for (let x = 18; x < width; x += 29) {
      ctx.beginPath();
      ctx.arc(x, y, 2.3, 0, TAU);
      ctx.fill();
    }
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
    drawBackdrop(ctx, width, height);
  }

  const effect = draft.effect ?? draft.reaction;
  if (effect?.id === 'energy-orb') {
    const [x, y, radius] = orbPlacement(draft.point, source, width, height);
    paintOrb(ctx, x, y, radius, 0.46, 1);
  } else if (effect) {
    const [x, y] = pointOnCover(draft.point, source, width, height);
    paintEffect(ctx, effect, x, y, width * (source ? 0.27 : 0.42), 0.46, source ? 0.64 : 0.9);
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

// Tones are [delay, start Hz, end Hz, length, waveform, gain].
// Noise bursts are [delay, length, start cutoff, end cutoff, gain].
const packSounds = {
  'energy-orb': {
    tones: [[0, 96, 225, 0.69, 'triangle', 0.24], [0.11, 189, 449, 0.61, 'sine', 0.17], [0.62, 865, 1430, 0.34, 'sine', 0.15], [0.65, 1296, 1728, 0.28, 'sine', 0.09]],
    bursts: [[0.2, 0.46, 610, 2850, 0.11]],
  },
  genjutsu: {
    tones: [[0, 158, 64, 0.72, 'triangle', 0.23], [0.17, 220, 78, 0.78, 'sine', 0.19], [0.94, 120, 42, 0.16, 'sine', 0.33], [1.28, 472, 720, 0.38, 'sine', 0.14]],
    bursts: [[0.31, 0.58, 360, 2200, 0.12], [0.94, 0.13, 3800, 340, 0.22]],
  },
  'shadow-blink': {
    tones: [[0, 65, 246, 0.42, 'triangle', 0.23], [0.42, 350, 81, 0.21, 'sine', 0.26]],
    bursts: [[0.12, 0.33, 460, 2300, 0.16], [0.43, 0.15, 2300, 200, 0.18]],
  },
  rift: {
    tones: [[0, 72, 250, 0.91, 'sine', 0.24], [0.11, 76, 255, 0.82, 'triangle', 0.11], [0.82, 425, 103, 0.46, 'sine', 0.24]],
    bursts: [[0.7, 0.35, 830, 280, 0.13]],
  },
  'time-shatter': {
    tones: [[0.06, 950, 366, 0.22, 'triangle', 0.15], [0.23, 1420, 580, 0.29, 'sine', 0.18], [0.90, 106, 660, 0.38, 'triangle', 0.19]],
    bursts: [[0.06, 0.2, 6000, 1200, 0.24], [0.24, 0.16, 4100, 850, 0.15]],
  },
  thunder: {
    tones: [[0.01, 150, 290, 0.2, 'sawtooth', 0.16], [0.22, 120, 33, 0.62, 'sine', 0.49]],
    bursts: [[0, 0.09, 5300, 1500, 0.19], [0.21, 0.21, 3100, 200, 0.22], [0.39, 0.32, 580, 110, 0.24]],
  },
  comet: {
    tones: [[0, 1140, 260, 0.57, 'sine', 0.26], [0.56, 132, 38, 0.55, 'sine', 0.55]],
    bursts: [[0.12, 0.34, 900, 2800, 0.10], [0.57, 0.49, 2200, 130, 0.34]],
  },
  'retro-signal': {
    tones: [[0, 860, 330, 0.14, 'square', 0.13], [0.19, 490, 140, 0.13, 'sawtooth', 0.15], [0.49, 750, 640, 0.12, 'square', 0.14], [0.76, 420, 990, 0.18, 'triangle', 0.17]],
    bursts: [[0.13, 0.16, 4500, 1050, 0.15], [0.58, 0.17, 3300, 310, 0.14]],
  },
  'pixel-warp': {
    tones: [[0, 840, 560, 0.11, 'square', 0.14], [0.13, 560, 370, 0.12, 'square', 0.14], [0.27, 370, 180, 0.23, 'triangle', 0.21], [0.72, 280, 420, 0.12, 'square', 0.13], [0.85, 420, 840, 0.23, 'triangle', 0.22]],
  },
  'bass-drop': {
    tones: [[0, 108, 169, 0.44, 'triangle', 0.22], [0.39, 152, 34, 0.79, 'sine', 0.64], [0.42, 86, 48, 0.35, 'triangle', 0.21]],
    bursts: [[0.39, 0.26, 1170, 150, 0.22]],
  },
  'holo-scan': {
    tones: [[0.01, 350, 460, 0.11, 'triangle', 0.17], [0.24, 490, 600, 0.11, 'triangle', 0.17], [0.48, 660, 760, 0.12, 'triangle', 0.17], [0.80, 1047, 1047, 0.39, 'sine', 0.22], [0.84, 1568, 1568, 0.27, 'sine', 0.12]],
  },
  'heart-bloom': {
    tones: [[0.02, 523, 523, 0.40, 'sine', 0.22], [0.13, 659, 659, 0.43, 'sine', 0.22], [0.24, 784, 784, 0.48, 'sine', 0.22], [0.40, 988, 988, 0.53, 'sine', 0.20], [0.63, 1318, 1302, 0.43, 'sine', 0.15]],
  },
  checkpoint: {
    tones: [[0.01, 392, 392, 0.13, 'triangle', 0.25], [0.13, 523, 523, 0.13, 'triangle', 0.27], [0.25, 784, 784, 0.43, 'triangle', 0.26], [0.29, 1047, 1047, 0.36, 'sine', 0.19]],
  },
};

export function createSoundEffects() {
  let audio;
  let volume;
  let channel;
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
    else stop();
  }

  function stop() {
    if (!channel) return;
    const previous = channel;
    channel = null;
    previous.gain.setTargetAtTime(0, audio.currentTime, 0.006);
    window.setTimeout(() => previous.disconnect(), 40);
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
    osc.connect(envelope).connect(channel);
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
    burst.connect(filter).connect(envelope).connect(channel);
    burst.start(at);
  }

  function play(id) {
    if (!enabled || audio?.state !== 'running') return;
    stop();
    channel = audio.createGain();
    channel.connect(volume);
    const at = audio.currentTime + 0.005;
    const preset = packSounds[id];
    if (preset) {
      preset.tones.forEach(([delay, ...notes]) => tone(at + delay, ...notes));
      preset.bursts?.forEach(([delay, ...burst]) => noise(at + delay, ...burst));
      return;
    }
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

  return { unlock, setEnabled, play, stop };
}
