const WIDTH = 480;
const HEIGHT = 270;
const DURATION = 12.4;
const TAU = Math.PI * 2;

let stylesPromise;
const imagePromises = new Map();

function loadStyles() {
  if (stylesPromise) return stylesPromise;
  const existing = document.querySelector('link[data-arcade-intro]');
  if (existing) return Promise.resolve();
  stylesPromise = new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "intro.css";
    link.dataset.arcadeIntro = "";
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
  return stylesPromise;
}

function loadImage(src) {
  if (imagePromises.has(src)) return imagePromises.get(src);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = () => resolve(image);
    image.onerror = reject;
  });
  imagePromises.set(src, promise);
  return promise;
}

// Stars fixed in the sky above the stadium (k = px above the stadium's top edge),
// revealed and scrolled down as the camera pans up. Deterministic so they don't jitter.
const STARS = Array.from({ length: 44 }, (_, i) => {
  const rand = n => { const s = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return s - Math.floor(s); };
  return { x: rand(1) * WIDTH, k: 10 + rand(2) * 196, big: rand(3) > 0.72, tw: rand(4) * TAU };
});

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => {
  const n = clamp(value);
  return n * n * (3 - 2 * n);
};
const range = (time, start, end) => clamp((time - start) / (end - start));

function rect(ctx, color, x, y, width, height) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

const STRIKER_SPRITES = [
  [0, 0, 520, 460],
  [520, 0, 520, 460],
  [1040, 0, 520, 460],
  [1560, 0, 520, 460],
  [2080, 0, 520, 460],
];
const KEEPER_SPRITES = [
  [0, 460, 520, 460],
  [520, 460, 520, 460],
  [1040, 460, 520, 460],
  [1560, 460, 520, 460],
  [2080, 460, 520, 460],
];
const REFEREE_SPRITES = Array.from({ length: 5 }, (_, index) => [index * 420, 0, 420, 460]);
const INFANTINO_SPRITES = Array.from({ length: 5 }, (_, index) => [index * 420, 460, 420, 460]);
const CROWD_SPRITES = Array.from({ length: 3 }, (_, column) => [
  [column * 512, 0, 512, 512],
  [column * 512, 512, 512, 512],
]);

// Sample the stadium art's top row so the sky revealed above it as the camera pans
// can be continued with an exactly-matching gradient (no hard seam at the image edge).
function sampleSky(stadium) {
  try {
    const strip = document.createElement("canvas");
    strip.width = stadium.width;
    strip.height = 1;
    const stripCtx = strip.getContext("2d", { willReadFrequently: true });
    stripCtx.drawImage(stadium, 0, 0, stadium.width, 1, 0, 0, stadium.width, 1);
    const { data } = stripCtx.getImageData(0, 0, stadium.width, 1);
    let r = 0, g = 0, b = 0;
    const n = data.length / 4;
    for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; }
    r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
    const deep = c => Math.round(c * 0.42);
    return { r, g, b, horizon: `rgb(${r},${g},${b})`, deep: `rgb(${deep(r)},${deep(g)},${Math.round(b * 0.55)})` };
  } catch (error) {
    // getImageData can fail (e.g. tainted canvas); fall back to a plausible night sky.
    return { r: 11, g: 16, b: 48, horizon: "#0b1030", deep: "#05060f" };
  }
}

function drawSprite(ctx, sprite, centerX, bottomY, targetHeight) {
  const targetWidth = targetHeight * sprite.width / sprite.height;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(sprite, centerX - targetWidth / 2, bottomY - targetHeight, targetWidth, targetHeight);
  ctx.imageSmoothingEnabled = false;
}

function buildSpriteFrames(atlas) {
  const extract = ([sx, sy, sw, sh], flip = false) => {
    const frame = document.createElement("canvas");
    frame.width = sw;
    frame.height = sh;
    const frameCtx = frame.getContext("2d");
    if (flip) {
      frameCtx.translate(sw, 0);
      frameCtx.scale(-1, 1);
    }
    frameCtx.drawImage(atlas, sx, sy, sw, sh, 0, 0, sw, sh);
    return frame;
  };
  return {
    striker: STRIKER_SPRITES.map(sprite => extract(sprite)),
    keeper: KEEPER_SPRITES.map(sprite => extract(sprite, true)),
  };
}

function buildOfficialFrames(atlas) {
  const extract = ([sx, sy, sw, sh], flip = false) => {
    const frame = document.createElement("canvas");
    frame.width = sw;
    frame.height = sh;
    const frameCtx = frame.getContext("2d");
    if (flip) {
      frameCtx.translate(sw, 0);
      frameCtx.scale(-1, 1);
    }
    frameCtx.drawImage(atlas, sx, sy, sw, sh, 0, 0, sw, sh);
    return frame;
  };
  return {
    referee: REFEREE_SPRITES.map((sprite, index) => extract(sprite, index === 0 || index === 2)),
    infantino: INFANTINO_SPRITES.map((sprite, index) => extract(sprite, index < 2)),
  };
}

function buildCrowdFrames(atlas) {
  return CROWD_SPRITES.map((animation, animationIndex) => animation.map(([sx, sy, sw, sh]) => {
    const frame = document.createElement("canvas");
    frame.width = sw;
    frame.height = sh;
    const frameCtx = frame.getContext("2d");
    if (animationIndex === 2) {
      frameCtx.translate(sw, 0);
      frameCtx.scale(-1, 1);
    }
    frameCtx.drawImage(atlas, sx, sy, sw, sh, 0, 0, sw, sh);
    return frame;
  }));
}

function drawCrowdAnimations(ctx, crowd, time, offset) {
  const cheerFrame = Math.floor(time * 3.2) % 2;
  const alternateFrame = 1 - cheerFrame;
  const photographerFrame = Math.floor((time + .2) * 1.35) % 2;
  drawSprite(ctx, crowd[0][cheerFrame], 52, 139 + offset, 30);
  drawSprite(ctx, crowd[0][alternateFrame], 430, 127 + offset, 24);
  drawSprite(ctx, crowd[1][cheerFrame], 198, 136 + offset, 34);
  drawSprite(ctx, crowd[2][photographerFrame], 422, 171 + offset, 50);
}

function drawReferee(ctx, officials, time, offset) {
  let frame = 0;
  if (time >= 5.05) frame = 1;
  if (time >= 5.8) frame = 2;
  if (time >= 7.1) frame = 4;
  const breath = frame === 0 ? Math.sin(time * TAU * 1.15) : 0;
  drawSprite(ctx, officials.referee[frame], 135, 204 + offset + breath, 78 * (1 + breath * .008));
}

function drawInfantino(ctx, officials, time, offset) {
  if (time < 4.95 || time >= 8.45) return;
  let frame;
  let x;
  if (time < 6.35) {
    frame = Math.floor((time - 4.95) / .22) % 2;
    x = -55 + ease(range(time, 4.95, 6.35)) * 155;
  } else if (time < 7.1) {
    frame = 2;
    x = 100;
  } else {
    frame = 3 + Math.floor((time - 7.1) / .13) % 2;
    x = 100 - ease(range(time, 7.1, 8.45)) * 188;
  }
  drawSprite(ctx, officials.infantino[frame], x, 211 + offset, 82);
}

function drawStriker(ctx, sprites, time, offset) {
  let frame = 0;
  if (time >= 1.7) frame = 1;
  if (time >= 2.35) frame = 2;
  if (time >= 3.18) frame = 3;
  if (time >= 4.25) frame = 4;
  const run = ease(range(time, 1.15, 3.18));
  const x = frame === 4 ? 222 : 68 + run * 142;
  const breath = frame === 0 ? Math.sin(time * TAU * 1.35) : 0;
  drawSprite(ctx, sprites.striker[frame], x, 232 + offset + breath * 1.4, 128 * (1 + breath * .012));
}

function drawKeeper(ctx, sprites, time, offset) {
  let frame = 0;
  if (time >= 3.18) frame = 1;
  if (time >= 3.52) frame = 2;
  if (time >= 4.18) frame = 3;
  if (time >= 4.72) frame = 4;
  const placements = [
    [342, 190, 126],
    [331, 190, 126],
    [307, 184, 126],
    [291, 199, 126],
    [282, 202, 126],
  ];
  const [x, bottom, height] = placements[frame];
  const breath = frame === 0 ? Math.sin(time * TAU * 1.35 + Math.PI) : 0;
  drawSprite(ctx, sprites.keeper[frame], x, bottom + offset + breath * 1.2, height * (1 + breath * .012));
}

function drawBall(ctx, time, offset) {
  const flight = range(time, 3.45, 4.35);
  let x = 220;
  let y = 218 + offset;
  if (flight > 0) {
    const p = ease(flight);
    x = 220 + p * 145;
    y = 218 - Math.sin(p * Math.PI) * 58 - p * 75 + offset;
  }
  const depth = ease(range(flight, .7, 1));
  const outerRadius = 8 - depth * 2.2;
  const innerRadius = 6.8 - depth * 1.8;
  const spin = flight * TAU * 2.5;
  if (flight === 0) {
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.beginPath();
    ctx.ellipse(x + 1, y + 7, 8, 2.5, 0, 0, TAU);
    ctx.fill();
  } else if (flight < 1) {
    for (let i = 3; i > 0; i--) {
      ctx.fillStyle = `rgba(235,244,255,${.05 * (4 - i)})`;
      ctx.beginPath();
      ctx.arc(x - i * 5, y + i * 1.5, 5.5 - i * .5, 0, TAU);
      ctx.fill();
    }
  }
  ctx.fillStyle = "#11182b";
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, 0, TAU);
  ctx.fill();
  const gradient = ctx.createRadialGradient(x - 2.5, y - 3, 1, x, y, innerRadius);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(.68, "#f4f3e9");
  gradient.addColorStop(1, "#aeb8c4");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, innerRadius, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.beginPath();
  ctx.arc(0, 0, innerRadius, 0, TAU);
  ctx.clip();
  const panelScale = innerRadius / 6.8;
  const pentagon = (centerX, centerY, radius, rotation = -Math.PI / 2) => {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = rotation + i * TAU / 5;
      const px = centerX + Math.cos(angle) * radius;
      const py = centerY + Math.sin(angle) * radius;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  };
  const outerPanels = [
    [-4.5, -2.7, 1.25, .2],
    [4.3, -2.4, 1.15, -.25],
    [-3.1, 4.3, 1.2, .5],
    [4.5, 3.6, 1.05, -.5],
  ];
  ctx.fillStyle = "#172033";
  pentagon(0, 0, 1.65 * panelScale);
  outerPanels.forEach(([px, py, radius, rotation]) => pentagon(px * panelScale, py * panelScale, radius * panelScale, rotation));
  ctx.strokeStyle = "#455166";
  ctx.lineWidth = .55;
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + i * TAU / 5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 1.65 * panelScale, Math.sin(angle) * 1.65 * panelScale);
    const panel = outerPanels[i % outerPanels.length];
    ctx.lineTo(panel[0] * panelScale, panel[1] * panelScale);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(-1.2 * panelScale, .6 * panelScale, 5.2 * panelScale, -.8, .95);
  ctx.stroke();
  ctx.restore();
}

function drawGoalForeground(ctx, time, offset) {
  const inside = ease(range(time, 4.08, 4.35));
  if (!inside) return;
  ctx.save();
  ctx.globalAlpha = .28 + inside * .62;
  ctx.strokeStyle = "#edf4fa";
  ctx.lineWidth = .55;
  for (let x = 268; x <= 398; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 110 + offset);
    ctx.lineTo(x + (x - 333) * .025, 165 + offset);
    ctx.stroke();
  }
  for (let y = 112; y <= 164; y += 7) {
    ctx.beginPath();
    ctx.moveTo(267, y + offset);
    ctx.lineTo(399, y + offset);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTitle(ctx, logo, time) {
  const reveal = ease(range(time, 9.2, 10.7));
  if (!reveal) return;
  const logoWidth = 418;
  const logoHeight = logoWidth * logo.height / logo.width;
  const logoY = 4 - (1 - reveal) * 120;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(logo, (WIDTH - logoWidth) / 2, logoY, logoWidth, logoHeight);
  ctx.imageSmoothingEnabled = false;
  if (time > 10.55) {
    const blink = time < 11.35 ? Math.floor(time * 12) % 2 : 1;
    if (blink) {
      ctx.textAlign = "center";
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#071333";
      ctx.strokeText("WORLD CUP TOUR", 240, 216);
      ctx.fillStyle = "#8eeaff";
      ctx.fillText("WORLD CUP TOUR", 240, 216);
      rect(ctx, "#e42f45", 139, 225, 202, 3);
      rect(ctx, "#ffe15b", 166, 231, 148, 2);
    }
  }
}

function drawFrame(ctx, assets, time, finished) {
  ctx.imageSmoothingEnabled = false;
  rect(ctx, "#080a21", 0, 0, WIDTH, HEIGHT);
  const pan = ease(range(time, 8.35, 10.1));
  const offset = pan * 192;
  // Continue the night sky into the strip revealed above the stadium as it pans down.
  // The gradient's bottom edge matches the stadium's top-row color, so there's no seam.
  if (offset > 0 && assets.sky) {
    const sky = ctx.createLinearGradient(0, 0, 0, offset);
    sky.addColorStop(0, assets.sky.deep);
    sky.addColorStop(1, assets.sky.horizon);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, Math.ceil(offset) + 1);
    for (const star of STARS) {
      if (star.k >= offset) continue;                     // not yet revealed
      const y = offset - star.k;
      const fade = clamp((offset - star.k) / 12);          // ease in as it clears the horizon
      const twinkle = 0.55 + 0.45 * Math.sin(time * 3 + star.tw);
      ctx.fillStyle = `rgba(214,226,255,${(0.5 * fade * twinkle).toFixed(3)})`;
      const s = star.big ? 2 : 1;
      ctx.fillRect(Math.round(star.x), Math.round(y), s, s);
    }
  }
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(assets.stadium, 0, offset, WIDTH, HEIGHT);
  ctx.imageSmoothingEnabled = false;
  // Feather the stadium's hard top edge into the sky so its clouds/floodlights
  // dissolve upward instead of being sliced off at the image boundary.
  if (offset > 0 && assets.sky) {
    const { r, g, b } = assets.sky;
    const featherH = 34;
    const feather = ctx.createLinearGradient(0, offset, 0, offset + featherH);
    feather.addColorStop(0, `rgba(${r},${g},${b},1)`);
    feather.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = feather;
    ctx.fillRect(0, offset, WIDTH, featherH);
  }

  if (time < 10.15) {
    drawCrowdAnimations(ctx, assets.crowd, time, offset);
    drawReferee(ctx, assets.officials, time, offset);
    drawInfantino(ctx, assets.officials, time, offset);
    drawBall(ctx, time, offset);
    drawGoalForeground(ctx, time, offset);
    drawKeeper(ctx, assets.sprites, time, offset);
    drawStriker(ctx, assets.sprites, time, offset);
  }

  if (time > 4.15 && time < 4.38) {
    ctx.fillStyle = `rgba(255,255,255,${.65 * (1 - range(time, 4.15, 4.38))})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  if (time > 4.4 && time < 5.55) {
    ctx.textAlign = "center";
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillStyle = Math.floor(time * 8) % 2 ? "#ffe052" : "#fff";
    ctx.fillText("GOAL!", 240, 44 + offset);
  }
  if (pan > .25 || finished) drawTitle(ctx, assets.logo, finished ? DURATION : time);
  if (time < .7) {
    ctx.fillStyle = `rgba(0,0,0,${1 - ease(time / .7)})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}

function createArcadeSfx(audioContext) {
  if (!audioContext) return null;
  const master = audioContext.createGain();
  master.gain.value = .22;
  master.connect(audioContext.destination);
  const liveNodes = new Set();

  function track(node) {
    liveNodes.add(node);
    node.addEventListener?.("ended", () => liveNodes.delete(node), { once: true });
    return node;
  }

  function tone(type, frequency, endFrequency, delay, duration, volume) {
    const now = audioContext.currentTime + delay;
    const oscillator = track(audioContext.createOscillator());
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    oscillator.connect(gain).connect(master);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  function noise(delay, duration, volume, filterType, frequency) {
    const now = audioContext.currentTime + delay;
    const buffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * duration), audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = track(audioContext.createBufferSource());
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    source.buffer = buffer;
    filter.type = filterType;
    filter.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    source.connect(filter).connect(gain).connect(master);
    source.start(now);
  }

  return {
    kick() {
      tone("square", 145, 42, 0, .13, .55);
      noise(0, .075, .38, "lowpass", 900);
    },
    net() {
      noise(0, .22, .42, "highpass", 2100);
      tone("triangle", 680, 310, 0, .18, .17);
      tone("triangle", 920, 380, .035, .16, .12);
    },
    cheer() {
      noise(.03, 1.25, .25, "bandpass", 1250);
      for (let i = 0; i < 5; i++) tone("square", 150 + i * 23, 115 + i * 17, .05 + i * .045, .42, .055);
    },
    setMuted(muted) {
      master.gain.setTargetAtTime(muted ? 0 : .22, audioContext.currentTime, .015);
    },
    stop() {
      liveNodes.forEach(node => { try { node.stop(); } catch (error) { /* already stopped */ } });
      liveNodes.clear();
      master.disconnect();
    },
  };
}

function createOverlay(onClose, audio, sfxContext, assets) {
  const overlay = document.createElement("section");
  overlay.id = "arcade-intro";
  overlay.className = "arcade-intro";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "arcade-intro-title");
  overlay.innerHTML = `
    <h2 class="arcade-intro__sr" id="arcade-intro-title">Infantino Flights '26: World Cup Tour</h2>
    <div class="arcade-intro__stage"><canvas class="arcade-intro__canvas" width="${WIDTH}" height="${HEIGHT}" aria-label="Pixel-art penalty kick in a packed soccer stadium"></canvas></div>
    <div class="arcade-intro__grain" aria-hidden="true"></div>
    <button class="arcade-intro__sound" type="button" aria-label="Mute music" title="Mute music">&#9835;</button>
    <button class="arcade-intro__skip" type="button" aria-label="Close intro" title="Close">&times;</button>
    <div class="arcade-intro__actions" aria-label="Intro controls">
      <button class="arcade-intro__action arcade-intro__replay" type="button"><span class="btn-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg></span>Replay</button>
      <button class="arcade-intro__action arcade-intro__action--close arcade-intro__close" type="button"><span class="btn-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></span>Close</button>
    </div>`;
  document.body.appendChild(overlay);

  const canvas = overlay.querySelector("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = WIDTH;
  frameCanvas.height = HEIGHT;
  const frameCtx = frameCanvas.getContext("2d", { alpha: false });
  const replay = overlay.querySelector(".arcade-intro__replay");
  const sound = overlay.querySelector(".arcade-intro__sound");
  const closeButtons = overlay.querySelectorAll(".arcade-intro__skip,.arcade-intro__close");
  let frameId = 0;
  let start = 0;
  let previousElapsed = 0;
  let closed = false;
  let finished = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let muted = false;
  const sfx = createArcadeSfx(sfxContext);
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  function paint(time, isFinished) {
    drawFrame(frameCtx, assets, time, isFinished);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(frameCanvas, 0, 0);
  }

  function finish() {
    finished = true;
    overlay.classList.add("is-finished");
    paint(DURATION, true);
    replay.focus();
  }

  function animate(timestamp) {
    if (!start) start = timestamp;
    const elapsed = (timestamp - start) / 1000;
    if (previousElapsed < 3.45 && elapsed >= 3.45) sfx?.kick();
    if (previousElapsed < 4.35 && elapsed >= 4.35) {
      sfx?.net();
      sfx?.cheer();
    }
    previousElapsed = elapsed;
    paint(elapsed, false);
    if (elapsed >= DURATION) finish();
    else frameId = requestAnimationFrame(animate);
  }

  function restart() {
    cancelAnimationFrame(frameId);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
    finished = false;
    start = 0;
    previousElapsed = 0;
    overlay.classList.remove("is-finished");
    overlay.querySelector(".arcade-intro__skip").focus();
    frameId = requestAnimationFrame(animate);
  }

  function close() {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(frameId);
    audio?.pause();
    sfx?.stop();
    sfxContext?.close().catch(() => {});
    document.removeEventListener("keydown", onKeydown);
    document.body.style.overflow = previousOverflow;
    overlay.remove();
    onClose?.();
  }

  function onKeydown(event) {
    if (event.key === "Escape") close();
    if (event.key === "Tab") {
      const focusable = [...overlay.querySelectorAll("button")].filter(button => button.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }

  closeButtons.forEach(button => button.addEventListener("click", close));
  replay.addEventListener("click", restart);
  if (!audio && !sfx) sound.hidden = true;
  sound.addEventListener("click", () => {
    muted = !muted;
    if (audio) {
      audio.muted = muted;
      if (!muted && audio.paused) audio.play().catch(() => {});
    }
    sfx?.setMuted(muted);
    sound.classList.toggle("is-muted", muted);
    sound.setAttribute("aria-label", muted ? "Unmute music" : "Mute music");
    sound.title = muted ? "Unmute music" : "Mute music";
  });
  document.addEventListener("keydown", onKeydown);
  overlay.querySelector(".arcade-intro__skip").focus();

  if (finished) finish();
  else frameId = requestAnimationFrame(animate);
}

export async function openIntro({ onClose, audio, sfxContext, onProgress } = {}) {
  const requests = [
    loadStyles(),
    loadImage("arcade-players.webp"),
    loadImage("arcade-officials.webp"),
    loadImage("arcade-crowd-animations.webp"),
    loadImage("arcade-stadium.webp"),
    loadImage("arcade-logo.webp"),
  ];
  let completedRequests = 0;
  onProgress?.(0);
  const [, atlas, officialsAtlas, crowdAtlas, stadium, logo] = await Promise.all(requests.map(request => request.then(result => {
    completedRequests++;
    onProgress?.(.9 * completedRequests / requests.length);
    return result;
  })));
  const assets = {
    sprites: buildSpriteFrames(atlas),
    officials: buildOfficialFrames(officialsAtlas),
    crowd: buildCrowdFrames(crowdAtlas),
    stadium,
    logo,
    sky: sampleSky(stadium),
  };
  if (!document.getElementById("arcade-intro")) createOverlay(onClose, audio, sfxContext, assets);
  onProgress?.(1);
}
