// Numeric constants — projection, emissions, conversion, and animation tuning.

// Equirectangular projection, tuned to the North America view.
export const W = 920, H = 600;
export const lonMin = -168, lonMax = -52, latMin = 6, latMax = 64;

// Emissions + unit conversion.
export const CO2_PER_MILE = 3 / 1000;   // tonnes CO2 per mile (~3 kg)
export const KM_PER_MILE = 1.60934;
export const EARTH_RADIUS_MI = 3958.8;  // mean Earth radius, for great-circle distance

// Animation tuning.
export const SPEED = 0.012;             // legs advanced per animation frame
export const PAUSE_FRAMES = 240;        // ~4s hold at each stop (60fps)
