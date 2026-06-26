// View layer — builds the SVG map, runs the animation, wires up the controls.

import { W, H, lonMin, lonMax, latMin, latMax, CO2_PER_MILE, SPEED_PER_SEC, PAUSE_MS, MAX_FRAME_MS } from "./constants.js";
import { stops, legMiles, totalMiles, co2Steps } from "./data.js";
import { NA_OUTLINES } from "./geo.js";
import { proj, milesToUnit, co2MilestoneIndex, gamesAttended, tripCost, stopSlug, stopIndexFromParam } from "./core.js";

// ---- UI state ----
let unit = "mi";   // active display unit
let co2Idx = -1;   // last shown CO2 milestone tier

const NS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("map");
function el(t, a) { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; }

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

const plane = el("text", { class: "plane", "text-anchor": "middle", "dominant-baseline": "central" });
plane.textContent = "✈️";
svg.appendChild(plane);

// ---- controls + element refs ----
const slider = document.getElementById("slider"), pp = document.getElementById("pp");
const milesEl = document.getElementById("miles"), co2El = document.getElementById("co2"),
  gamesEl = document.getElementById("games"), legEl = document.getElementById("leg"),
  milesLabelEl = document.getElementById("milesLabel"), co2NoteEl = document.getElementById("co2note"), costEl = document.getElementById("cost");
const unitToggle = document.getElementById("unit"), uMi = unitToggle.querySelector(".u-mi"), uKm = unitToggle.querySelector(".u-km");
function setUnit(u) { unit = u; uMi.classList.toggle("on", u === "mi"); uKm.classList.toggle("on", u === "km"); render(); }
unitToggle.addEventListener("click", () => setUnit(unit === "mi" ? "km" : "mi"));

// ---- animation ----
const N = stops.length - 1; // legs
let t = 0, playing = true;
let pauseTimer = PAUSE_MS; // ms left to hold at the current stop (starts at the first city)
let lastTs = 0;            // timestamp of the previous frame; 0 = loop just (re)started
const lerp = (a, b, f) => a + (b - a) * f;

function vsHtml(s) {
  if (!s.f1) return '<div class="vs-summit">🏢</div><span class="match">' + s.match + '</span>' + (s.note ? '<span class="vs-score">' + s.note + '</span>' : '');
  return '<div class="vs-display"><span class="vs-flag">' + s.f1 + '</span><span class="vs-text">VS</span><span class="vs-flag">' + s.f2 + '</span></div><span class="match">' + s.match + (s.note ? ' (' + s.note + ')' : '') + '</span>';
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
  costEl.textContent = "$" + Math.round(tripCost(miles, Math.min(Math.floor(t), N))).toLocaleString();

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
    const s = stops[N];
    legEl.innerHTML = vsHtml(s) + '<span class="dt">' + s.date + ' &middot; ' + s.n + (s.v ? ' &middot; ' + s.v : '') + ' &middot; ' + Math.round(milesToUnit(totalMiles, unit)).toLocaleString() + ' ' + unit + ' total</span>';
  } else if (pauseTimer > 0 || f < 0.06) {
    const s = stops[seg];
    legEl.innerHTML = vsHtml(s) + '<span class="dt">' + s.date + ' &middot; ' + s.n + (s.v ? ' &middot; ' + s.v : '') + '</span>';
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
  if (t >= N) { t = N; render(); playing = false; pp.innerHTML = "&#8635; Replay"; return; }
  render();
  requestAnimationFrame(tick);
}
pp.addEventListener("click", () => {
  if (t >= N) { t = 0; playing = true; pauseTimer = PAUSE_MS; lastTs = 0; pp.innerHTML = "&#9208; Pause"; requestAnimationFrame(tick); return; }
  playing = !playing; pp.innerHTML = playing ? "&#9208; Pause" : "&#9654; Play";
  if (playing) { lastTs = 0; requestAnimationFrame(tick); }
});
slider.addEventListener("input", () => { t = parseFloat(slider.value); pauseTimer = 0; playing = false; pp.innerHTML = t >= N ? "&#8635; Replay" : "&#9654; Play"; render(); });

// Deep link: ?stop=<1-based number | date-city slug> opens paused at that stop.
const sharedIdx = stopIndexFromParam(new URLSearchParams(location.search).get("stop"));
if (sharedIdx >= 0) { t = sharedIdx; playing = false; pp.innerHTML = sharedIdx >= N ? "&#8635; Replay" : "&#9654; Play"; }

// Share button: copy a link to the stop currently on screen.
const shareBtn = document.getElementById("share");
shareBtn.addEventListener("click", async () => {
  const idx = Math.max(0, Math.min(N, Math.round(t)));
  const url = location.origin + location.pathname + "?stop=" + stopSlug(stops[idx]);
  try { await navigator.clipboard.writeText(url); } catch (e) { /* clipboard may be blocked */ }
  const orig = shareBtn.innerHTML;
  shareBtn.innerHTML = "&#10003; Copied";
  setTimeout(() => { shareBtn.innerHTML = orig; }, 1500);
});

// Full itinerary in the footer accordion (kept in sync with the data).
document.getElementById("stoplist").innerHTML = stops.map(s => {
  const game = s.f1 ? s.f1 + " " + s.match + " " + s.f2 : "🏢 " + s.match;
  const where = s.v || s.note || "";
  return "<li><span class='sl-game'>" + game + "</span>" +
    "<span class='sl-meta'>" + s.date + " &middot; " + s.n + (where ? " &middot; " + where : "") + "</span></li>";
}).join("");
document.getElementById("stopcount").textContent = stops.length;

render();
requestAnimationFrame(tick); // returns immediately if a deep link paused us
