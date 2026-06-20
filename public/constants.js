// Numeric constants — projection, emissions, conversion, and animation tuning.

// Equirectangular projection, tuned to the North America view.
// Bounds hug the actual route (Vancouver / Mexico City / Miami) with padding for
// labels — cropping Alaska, the open Pacific, and northern Canada. The lon:lat
// range ratio (~1.53) matches W:H so the continent isn't stretched.
export const W = 920, H = 600;
export const lonMin = -131, lonMax = -72, latMin = 14, latMax = 52.5;

// Emissions + unit conversion.
export const CO2_PER_MILE = 3 / 1000;   // tonnes CO2 per mile (~3 kg)
export const KM_PER_MILE = 1.60934;
export const EARTH_RADIUS_MI = 3958.8;  // mean Earth radius, for great-circle distance

// Animation tuning.
export const SPEED = 0.012;             // legs advanced per animation frame
export const PAUSE_FRAMES = 240;        // ~4s hold at each stop (60fps)
