// Pure logic — no DOM. Unit-tested with Jest.

import { W, H, lonMin, lonMax, latMin, latMax, KM_PER_MILE, EARTH_RADIUS_MI } from "./constants.js";
import { stops, co2Steps } from "./data.js";

// Project lon/lat to SVG x/y (equirectangular).
export function proj(lon, lat) {
  return [(lon - lonMin) / (lonMax - lonMin) * W, (latMax - lat) / (latMax - latMin) * H];
}

// Great-circle distance between two lon/lat points, in miles.
export function haversineMiles(lon1, lat1, lon2, lat2) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(a));
}

// Convert miles to the active display unit.
export function milesToUnit(mi, unit) {
  return unit === "km" ? mi * KM_PER_MILE : mi;
}

// Index of the highest CO2 milestone reached at `tonnes` (-1 if none yet).
export function co2MilestoneIndex(tonnes) {
  let cs = -1;
  for (let i = 0; i < co2Steps.length; i++) if (tonnes >= co2Steps[i].t) cs = i;
  return cs;
}

// Matches attended through stop index `reachedIdx` (stops with flags; summit excluded).
export function gamesAttended(reachedIdx) {
  let count = 0;
  for (let i = 0; i <= reachedIdx; i++) if (stops[i] && stops[i].f1) count++;
  return count;
}

// Stable, shareable slug for a stop, derived from its date + city (e.g. "jun-21-miami").
// Unique across the itinerary because repeat cities differ by date.
export function stopSlug(stop) {
  return (stop.date + " " + stop.n).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Resolve a ?stop= value to a 0-based stop index, or -1 if unrecognized.
// Accepts a 1-based stop number ("1".."17") or a date-city slug ("jun-21-miami").
export function stopIndexFromParam(param) {
  if (param == null) return -1;
  const p = String(param).trim().toLowerCase();
  if (!p) return -1;
  if (/^\d+$/.test(p)) {
    const i = parseInt(p, 10) - 1; // 1-based for humans
    return i >= 0 && i < stops.length ? i : -1;
  }
  return stops.findIndex(s => stopSlug(s) === p);
}
