// View layer — builds the SVG map, runs the animation, wires up the controls.

import { W, H, lonMin, lonMax, latMin, latMax, CO2_PER_MILE, SPEED_PER_SEC, PAUSE_MS, MAX_FRAME_MS } from "./constants.js";
import { stops, legMiles, totalMiles, co2Steps, dataUpdated, projected, CITIES } from "./data.js";
import { NA_OUTLINES } from "./geo.js";
import { proj, milesToUnit, co2MilestoneIndex, gamesAttended, tripCost, stopSlug, stopIndexFromParam, haversineMiles } from "./core.js";

// ---- UI state ----
let unit = "mi";   // active display unit
let co2Idx = -1;   // last shown CO2 milestone tier

const NS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("map");
function el(t, a) { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; }

// Play/pause/replay labels: an inline SVG icon (centred artwork) + text. The icon is
// aria-hidden so screen readers announce only the label.
const btnIco = path => '<span class="btn-ico" aria-hidden="true"><svg viewBox="0 0 24 24">' + path + '</svg></span>';
const LBL_PAUSE = btnIco('<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>') + "Pause";
const LBL_PLAY = btnIco('<path d="M8 5v14l11-7z"/>') + "Play";
const LBL_REPLAY = btnIco('<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>') + "Replay";
const ICO_CHECK = '<path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>';

// ocean
svg.appendChild(el("rect", { x: 0, y: 0, width: W, height: H, class: "ocean" }));

// graticule (within the visible bounds)
for (let lon = -130; lon <= -70; lon += 10) {
  const [x1, y1] = proj(lon, latMin), [x2, y2] = proj(lon, latMax);
  svg.appendChild(el("line", { x1, y1, x2, y2, class: "graticule" }));
}
for (let lat = 20; lat <= 50; lat += 10) {
  const [x1, y1] = proj(lonMin, lat), [x2, y2] = proj(lonMax, lat);
  svg.appendChild(el("line", { x1, y1, x2, y2, class: "graticule" }));
}

// land
const hosts = new Set(["United States of America", "Canada", "Mexico"]);
for (const name in NA_OUTLINES) {
  for (const ring of NA_OUTLINES[name]) {
    let d = "";
    for (let i = 0; i < ring.length; i++) {
      const [x, y] = proj(ring[i][0], ring[i][1]);
      d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    d += "Z";
    svg.appendChild(el("path", { d, class: "land" + (hosts.has(name) ? " host" : "") }));
  }
}

const pts = stops.map(s => proj(s.lon, s.lat));

// background dashed full route
let bg = "";
pts.forEach((p, i) => bg += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ");
svg.appendChild(el("path", { d: bg, class: "route-bg" }));

// Projected onward route — a dashed line from the last confirmed stop through the
// fixtures Infantino is expected to attend next. Drawn under the live route + dots;
// its node halos + round tags go on top (after the dots below). Purely estimated.
const projPts = projected.map(s => proj(s.lon, s.lat));
if (projPts.length) {
  const last = pts[pts.length - 1];
  let prev = last;
  let pd = "M" + last[0].toFixed(1) + " " + last[1].toFixed(1) + " ";
  projPts.forEach(p => {
    // skip a zero-length hop (e.g. the final is in the city he's already in)
    if (p[0].toFixed(1) !== prev[0].toFixed(1) || p[1].toFixed(1) !== prev[1].toFixed(1)) {
      pd += "L" + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
      prev = p;
    }
  });
  svg.appendChild(el("path", { d: pd, class: "route-proj" }));
}

const fg = el("path", { class: "route-fg", d: "" });
svg.appendChild(fg);

const pulse = el("circle", { r: 5, class: "ring" });
svg.appendChild(pulse);

const dots = [], labels = [];
const labelOffsets = {
  1: { anchor: "end", dx: -9, dy: -9 },   // Guadalajara: push left
  12: { anchor: "end", dx: -9, dy: -9 },  // Boston: push left (near edge)
  18: { anchor: "end", dx: -9, dy: 15 },  // Philadelphia: left + below (it's right next to NYC)
  19: { anchor: "end", dx: -9, dy: -9 },  // New York: left + above (separate from PHL)
  21: { anchor: "end", dx: -9, dy: -9 },  // Toronto: left + above (clear of Boston/NY to the SE)
};
const seen = {}; // cities visited more than once share one dot + label
stops.forEach((s, i) => {
  const [x, y] = pts[i];
  const key = x.toFixed(1) + "," + y.toFixed(1);
  if (seen[key]) { // repeat visit: reuse the existing marker so labels don't double up
    dots.push(seen[key].dot);
    labels.push(seen[key].lab);
    return;
  }
  const dot = svg.appendChild(el("circle", { cx: x, cy: y, r: 5, class: "city" }));
  const ov = labelOffsets[i];
  const anchor = ov ? ov.anchor : (s.lon < -110 ? "end" : "start");
  const dx = ov ? ov.dx : (anchor === "end" ? -9 : 9);
  const dy = ov ? ov.dy : (i % 2 ? 14 : -9);
  const lab = el("text", { x: x + dx, y: y + dy, class: "clabel", "text-anchor": anchor });
  lab.textContent = s.n;
  svg.appendChild(lab);
  dots.push(dot); labels.push(lab);
  seen[key] = { dot, lab };
});

// Projected-stop markers: a hollow ring haloing the (already-visited) city dot plus
// a short round badge, so the upcoming fixtures read as distinct from the flown route.
// Offsets are keyed by city (not array position) so they stay correct as fixtures are
// promoted off the projected list; hand-tuned to clear each label and the map edge.
const projTagPos = {
  "Atlanta":  { dx: 11, dy: -9, anchor: "start" },   // above-right, into open ground
  "Miami":    { dx: 11, dy: -9, anchor: "start" },   // above-right, over the Atlantic
  "New York": { dx: -11, dy: 17, anchor: "end" },    // below-left, away from the map edge
};
projected.forEach((s, i) => {
  const [x, y] = projPts[i];
  svg.appendChild(el("circle", { cx: x, cy: y, r: 8, class: "proj-node" }));
  const o = projTagPos[s.n] || { dx: 11, dy: -9, anchor: "start" };
  const tag = el("text", { x: x + o.dx, y: y + o.dy, class: "proj-label", "text-anchor": o.anchor });
  tag.textContent = s.tag + " " + s.date.replace("Jul ", "7/");
  svg.appendChild(tag);
});

const plane = el("text", { class: "plane", "text-anchor": "middle", "dominant-baseline": "central" });
plane.textContent = "✈️";
svg.appendChild(plane);

// ---- controls + element refs ----
const slider = document.getElementById("slider"), pp = document.getElementById("pp");
const milesEl = document.getElementById("miles"), co2El = document.getElementById("co2"),
  gamesEl = document.getElementById("games"), legEl = document.getElementById("leg"),
  milesLabelEl = document.getElementById("milesLabel"), co2NoteEl = document.getElementById("co2note"), costEl = document.getElementById("cost");
// mi/km is a native radio group (keyboard + screen-reader friendly), but for
// pointers the WHOLE control toggles: a tap anywhere flips the unit instead of
// requiring a precise hit on the off radio.
const unitToggle = document.getElementById("unit");
function setUnit(u) { unit = u; document.getElementById("unit-" + u).checked = true; render(); }
// preventDefault stops the native label→radio selection so our flip is the single
// source of truth (otherwise a tap on a label and our handler could fight).
unitToggle.addEventListener("click", (e) => { e.preventDefault(); setUnit(unit === "mi" ? "km" : "mi"); });
// Keyboard (arrow keys / space) still selects via the native radios.
unitToggle.addEventListener("change", (e) => { if (e.target.name === "unit") setUnit(e.target.value); });

// ---- animation ----
const N = stops.length - 1; // legs
// Landing fees are per *flight*, so a zero-mile leg (a game in the city he's already
// in) incurs none. Count only flown legs among the first n for the cost model.
const flownLegs = n => { let c = 0; for (let i = 0; i < n; i++) if (legMiles[i] > 0) c++; return c; };
let t = 0, playing = true;
let pauseTimer = PAUSE_MS; // ms left to hold at the current stop (starts at the first city)
let lastTs = 0;            // timestamp of the previous frame; 0 = loop just (re)started
const lerp = (a, b, f) => a + (b - a) * f;

function vsHtml(s) {
  // Non-game stops (summit/reception): icon + title only. The venue/context (note)
  // is folded into the date line so these captions stay the same height as games.
  if (!s.f1) return '<div class="vs-summit">🏢</div><span class="match">' + s.match + '</span>';
  return '<div class="vs-display"><span class="vs-flag">' + s.f1 + '</span><span class="vs-text">VS</span><span class="vs-flag">' + s.f2 + '</span></div><span class="match">' + s.match + (s.note ? ' (' + s.note + ')' : '') + '</span>';
}

// The caption shows just the venue for a non-game stop: strip the trailing
// "· no match" marker and any "— extra context" clause (kept in the data + sources),
// so the date line stays one line and matches the height of game captions.
function captionNote(n) {
  const cleaned = n.replace(/\s*[·—-]\s*no match\s*$/i, "").trim();
  const dash = cleaned.indexOf("—");
  return (dash > 0 ? cleaned.slice(0, dash) : cleaned).trim();
}

// Full caption HTML for a stop: matchup/title + a single compact date · place line.
function stopCaption(s) {
  const extra = !s.f1 && s.note ? captionNote(s.note) : "";
  return vsHtml(s) + '<span class="dt">' + s.date + ' &middot; ' + s.n +
    (s.v ? ' &middot; ' + s.v : '') + (extra ? ' &middot; ' + extra : '') + '</span>';
}

function render() {
  const end = t >= N;
  const seg = Math.min(Math.floor(t), N - 1);
  const f = Math.min(t - seg, 1);

  let d = "";
  const upto = end ? N : seg;
  for (let i = 0; i <= upto; i++) d += (i ? "L" : "M") + pts[i][0].toFixed(1) + " " + pts[i][1].toFixed(1) + " ";
  let px, py;
  if (!end) { px = lerp(pts[seg][0], pts[seg + 1][0], f); py = lerp(pts[seg][1], pts[seg + 1][1], f); d += "L" + px.toFixed(1) + " " + py.toFixed(1); }
  else { px = pts[N][0]; py = pts[N][1]; }
  fg.setAttribute("d", d);
  plane.setAttribute("x", px); plane.setAttribute("y", py);
  // Aim the ✈️ nose along the current leg, always rotating around the plane's CURRENT
  // center (+45° because the glyph points up-right). At the end, face along the final leg —
  // and crucially update the rotation center to px,py so it doesn't fling off a stale center.
  const faceLeg = end ? N - 1 : seg;
  const ang = Math.atan2(pts[faceLeg + 1][1] - pts[faceLeg][1], pts[faceLeg + 1][0] - pts[faceLeg][0]) * 180 / Math.PI;
  plane.setAttribute("transform", "rotate(" + (ang + 45) + " " + px + " " + py + ")");

  let miles = 0; for (let i = 0; i < seg; i++) miles += legMiles[i];
  miles = end ? totalMiles : miles + legMiles[seg] * f;
  milesEl.textContent = Math.round(milesToUnit(miles, unit)).toLocaleString();
  milesLabelEl.textContent = unit === "km" ? "Km flown" : "Miles flown";
  co2El.textContent = (miles * CO2_PER_MILE).toFixed(1);
  costEl.textContent = "$" + Math.round(tripCost(miles, flownLegs(Math.min(Math.floor(t), N)))).toLocaleString();

  // CO2 milestone: update text, flash when a new (higher) tier is crossed
  const cs = co2MilestoneIndex(miles * CO2_PER_MILE);
  if (cs !== co2Idx) {
    const up = cs > co2Idx; co2Idx = cs;
    co2NoteEl.innerHTML = cs >= 0 ? co2Steps[cs].m : "";
    if (up && cs >= 0) { co2NoteEl.classList.remove("flash"); void co2NoteEl.offsetWidth; co2NoteEl.classList.add("flash"); }
  }

  // games attended = matches reached (Miami summit excluded)
  const reached = end ? N : seg + (f >= 1 ? 1 : 0);
  gamesEl.textContent = gamesAttended(Math.min(reached, N));

  const atStop = end || f < 0.06 || f > 0.94;
  const stopIdx = end ? N : (f > 0.94 ? seg + 1 : seg);
  dots.forEach((dot, i) => { dot.classList.remove("visited", "current"); labels[i].classList.remove("current"); });
  for (let i = 0; i <= (end ? N : seg); i++) dots[i].classList.add("visited");
  if (f > 0.94 && !end) dots[seg + 1].classList.add("visited");
  if (atStop) {
    dots[stopIdx].classList.add("current"); labels[stopIdx].classList.add("current");
    pulse.setAttribute("cx", pts[stopIdx][0]); pulse.setAttribute("cy", pts[stopIdx][1]);
    pulse.style.opacity = "0.9"; pulse.setAttribute("r", end ? 9 : 5 + 10 * (end ? 0 : (f < 0.5 ? f : 1 - f)));
  } else pulse.style.opacity = "0";

  // caption
  if (end) {
    legEl.innerHTML = stopCaption(stops[N]);
  } else if (pauseTimer > 0 || f < 0.06) {
    legEl.innerHTML = stopCaption(stops[seg]);
  } else {
    const ns = stops[seg + 1];
    legEl.innerHTML = 'Flying to <b>' + ns.n + '</b><span class="dt">next: ' + ns.match + ' (' + ns.date + ')</span>';
  }
  slider.value = t;
}

// Time-based loop: advance by real elapsed ms so the pace is the same at any
// refresh rate. `ts` is the DOMHighResTimeStamp rAF passes in; lastTs===0 marks
// a fresh (re)start so the first frame contributes no motion.
function tick(ts) {
  if (!playing) return; // stop the loop when paused so resume starts exactly one loop
  if (!lastTs) lastTs = ts;
  const dt = Math.min(ts - lastTs, MAX_FRAME_MS); // cap so a backgrounded tab doesn't jump on return
  lastTs = ts;
  if (pauseTimer > 0) { pauseTimer -= dt; render(); requestAnimationFrame(tick); return; }
  const prev = Math.floor(t);
  t += SPEED_PER_SEC * dt / 1000;
  const cur = Math.floor(t);
  if (cur > prev && t < N) { t = cur; pauseTimer = PAUSE_MS; }
  if (t >= N) { t = N; render(); playing = false; pp.innerHTML = LBL_REPLAY; return; }
  render();
  requestAnimationFrame(tick);
}
pp.addEventListener("click", () => {
  if (t >= N) { t = 0; playing = true; pauseTimer = PAUSE_MS; lastTs = 0; pp.innerHTML = LBL_PAUSE; requestAnimationFrame(tick); return; }
  playing = !playing; pp.innerHTML = playing ? LBL_PAUSE : LBL_PLAY;
  if (playing) { lastTs = 0; requestAnimationFrame(tick); }
});
slider.addEventListener("input", () => { t = parseFloat(slider.value); pauseTimer = 0; playing = false; pp.innerHTML = t >= N ? LBL_REPLAY : LBL_PLAY; render(); });

// Deep link: ?stop=<1-based number | date-city slug> opens paused at that stop.
const sharedIdx = stopIndexFromParam(new URLSearchParams(location.search).get("stop"));
if (sharedIdx >= 0) { t = sharedIdx; playing = false; pp.innerHTML = sharedIdx >= N ? LBL_REPLAY : LBL_PLAY; }

// Share button: copy a link to the stop currently on screen.
const shareBtn = document.getElementById("share");
shareBtn.addEventListener("click", async () => {
  const idx = Math.max(0, Math.min(N, Math.round(t)));
  const url = location.origin + location.pathname + "?stop=" + stopSlug(stops[idx]);
  try { await navigator.clipboard.writeText(url); } catch (e) { /* clipboard may be blocked */ }
  const orig = shareBtn.innerHTML;
  shareBtn.innerHTML = btnIco(ICO_CHECK) + "Copied";
  setTimeout(() => { shareBtn.innerHTML = orig; }, 1500);
});

// The optional arcade intro (including its stylesheet) is fetched only after the
// small footer trigger is activated. Pause this page's loop while it is covered,
// then restore the exact prior playback state when the overlay closes.
const introTrigger = document.getElementById("intro-trigger");
const introLoader = document.getElementById("intro-loader");
const introLoaderBar = introLoader.querySelector('[role="progressbar"]');
const introLoaderFill = document.getElementById("intro-loader-fill");
const introLoaderValue = document.getElementById("intro-loader-value");
let introLoading = false;

function setIntroProgress(value) {
  const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);
  introLoader.hidden = false;
  introLoaderFill.style.transform = `scaleX(${percent / 100})`;
  introLoaderValue.textContent = `${percent}%`;
  introLoaderBar.setAttribute("aria-valuenow", percent);
}

function waitForIntroAudio(audio) {
  if (audio.readyState >= 3) return Promise.resolve();
  return new Promise(resolve => {
    const timeout = setTimeout(finish, 5000);
    function finish() {
      clearTimeout(timeout);
      audio.removeEventListener("canplaythrough", finish);
      audio.removeEventListener("error", finish);
      resolve();
    }
    audio.addEventListener("canplaythrough", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
  });
}

introTrigger.addEventListener("click", async () => {
  if (introLoading || document.getElementById("arcade-intro")) return;
  introLoading = true;
  introTrigger.disabled = true;
  introTrigger.hidden = true;
  setIntroProgress(0);
  // Start the lazy audio request inside the click gesture so autoplay policies
  // permit it even though the visual module and stylesheet still need to load.
  const introAudio = new Audio("./intro-title-theme.mp3");
  introAudio.preload = "auto";
  introAudio.volume = .55;
  introAudio.play().catch(() => { /* visitor can retry via the music toggle */ });
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const introSfxContext = AudioContextClass ? new AudioContextClass() : null;
  introSfxContext?.resume().catch(() => { /* effects remain available after a later user gesture */ });
  const resumeTour = playing && t < N;
  if (resumeTour) {
    playing = false;
    pp.innerHTML = LBL_PLAY;
  }
  try {
    let completedInitialRequests = 0;
    const reportInitialRequest = () => setIntroProgress(++completedInitialRequests / 8);
    const modulePromise = import("./intro.js").then(module => { reportInitialRequest(); return module; });
    const audioPromise = waitForIntroAudio(introAudio).then(() => { reportInitialRequest(); });
    const [{ openIntro }] = await Promise.all([modulePromise, audioPromise]);
    await openIntro({
      audio: introAudio,
      sfxContext: introSfxContext,
      onProgress(progress) { setIntroProgress(.25 + progress * .75); },
      onClose() {
        introTrigger.focus();
        if (resumeTour && t < N) {
          playing = true;
          lastTs = 0;
          pp.innerHTML = LBL_PAUSE;
          requestAnimationFrame(tick);
        }
      },
    });
  } catch (error) {
    console.error("Unable to load arcade intro", error);
    introAudio.pause();
    introSfxContext?.close();
    if (resumeTour && t < N) {
      playing = true;
      lastTs = 0;
      pp.innerHTML = LBL_PAUSE;
      requestAnimationFrame(tick);
    }
  } finally {
    introLoading = false;
    introTrigger.disabled = false;
    introTrigger.hidden = false;
    introLoader.hidden = true;
  }
});

// Tick ruler under the slider: one mark per stop, taller/amber where the tournament
// phase changes (opener → R32 → R16 → QF → SF → Final) so it reads as a legend too.
(() => {
  const ticksEl = document.getElementById("ticks");
  if (!ticksEl) return;
  const phase = s => {
    const nt = s.note || "";
    if (/^Final/.test(nt)) return "F";
    if (/Semi-final/.test(nt)) return "SF";
    if (/Quarter-final/.test(nt)) return "QF";
    if (/Round of 16/.test(nt)) return "R16";
    if (/Round of 32/.test(nt)) return "R32";
    return "group";
  };
  let html = "";
  for (let i = 0; i <= N; i++) {
    const major = i === 0 || phase(stops[i]) !== phase(stops[i - 1]);
    html += '<span class="tick' + (major ? " major" : "") + '" style="left:' + (i / N * 100).toFixed(3) + '%"></span>';
  }
  ticksEl.innerHTML = html;
})();

// "By the numbers" — a recap of the completed tour, all derived from the itinerary
// so the figures can never drift from the data.
(() => {
  const list = document.getElementById("insights");
  if (!list) return;
  const games = stops.filter(s => s.f1).length;
  const flown = legMiles.filter(m => m > 0).length;         // landings only for real flights
  const cost = totalMiles * 24 + flown * 4000;
  const co2 = totalMiles * CO2_PER_MILE;
  const num = n => Math.round(n).toLocaleString();
  const fig = v => '<span class="fig">' + v + '</span>';

  // longest single hop
  let mx = 0; for (let i = 1; i < legMiles.length; i++) if (legMiles[i] > legMiles[mx]) mx = i;
  // most-visited city + the next tier
  const counts = {}; for (const s of stops) counts[s.n] = (counts[s.n] || 0) + 1;
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topN = ranked[0][1];
  const secondN = Math.max(...ranked.filter(r => r[1] < topN).map(r => r[1]));
  const secondCities = ranked.filter(r => r[1] === secondN).map(r => r[0]);
  // busiest single day (by games)
  const byDay = {}; stops.forEach(s => { if (s.f1) (byDay[s.date] = byDay[s.date] || []).push(s.n); });
  let day = { d: "", arr: [] };
  for (const [d, arr] of Object.entries(byDay)) if (arr.length > day.arr.length) day = { d, arr };
  // the round trip weather spared him (New York <-> Miami, never flown)
  const miamiRT = 2 * haversineMiles(CITIES["New York"][0], CITIES["New York"][1], CITIES["Miami"][0], CITIES["Miami"][1]);

  list.innerHTML = [
    `<b>Equator laps</b> &mdash; ${fig((totalMiles / 24901).toFixed(1) + "×")} around the Earth (${num(totalMiles)} mi flown in all)`,
    `<b>Longest hop</b> &mdash; ${fig(stops[mx].n + " → " + stops[mx + 1].n + ", " + num(legMiles[mx]) + " mi")}`,
    `<b>Per match</b> &mdash; ${fig("~" + num(totalMiles / games) + " mi")}, ${fig("~" + (co2 / games).toFixed(1) + " t CO₂")}, ${fig("~$" + num(Math.round(cost / games / 100) * 100))}`,
    `<b>Chaos day</b> &mdash; ${fig(day.arr.length + " games in one day")} (${day.d}): ${day.arr.join(" → ")}`,
    `<b>Favorite hub</b> &mdash; ${fig(ranked[0][0] + " ×" + topN)} (then ${secondCities.join(", ")} ×${secondN})`,
    `<b>The trip weather saved</b> &mdash; the Miami third-place would&rsquo;ve added ${fig("~" + num(Math.round(miamiRT / 10) * 10) + " mi")} (New York → Miami → New York)`,
  ].map(t => "<li>" + t + "</li>").join("");
})();

// Full itinerary in the footer accordion (kept in sync with the data).
document.getElementById("stoplist").innerHTML = stops.map(s => {
  const game = s.f1 ? s.f1 + " " + s.match + " " + s.f2 : "🏢 " + s.match;
  const where = s.v || s.note || "";
  return "<li><span class='sl-game'>" + game + "</span>" +
    "<span class='sl-meta'>" + s.date + " &middot; " + s.n + (where ? " &middot; " + where : "") + "</span></li>";
}).join("");
document.getElementById("stopcount").textContent = stops.length;

// "Data last updated" stamp — shown in a fixed zone (US Eastern) so every visitor
// sees the same instant, with the tz abbreviation appended.
const updatedEl = document.getElementById("updated");
const updatedDate = new Date(dataUpdated);
updatedEl.setAttribute("datetime", dataUpdated);
updatedEl.textContent = new Intl.DateTimeFormat("en-US", {
  year: "numeric", month: "short", day: "numeric",
  hour: "numeric", minute: "2-digit",
  timeZone: "America/New_York", timeZoneName: "short",
}).format(updatedDate);

render();
requestAnimationFrame(tick); // returns immediately if a deep link paused us
