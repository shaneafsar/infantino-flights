// Numeric constants — projection, emissions, conversion, and animation tuning.

// Equirectangular projection, tuned to the North America view.
// West edge hugs the route (Vancouver); east edge reaches past New York / Boston
// so the US East Coast stays in frame for future stops (NY/NJ hosts the final).
// Crops Alaska, the open Pacific, and northern Canada. Vertical crop kept tight,
// trading a slight (~7%) horizontal stretch for less empty space.
export const W = 920, H = 600;
export const lonMin = -131, lonMax = -68, latMin = 14, latMax = 52.5;

// Emissions + unit conversion.
// Gulfstream G650ER (the Qatar-flown jet): ~490 gal/hr × 9.57 kg CO2/gal ÷ ~540 mph.
export const CO2_PER_MILE = 8.7 / 1000;  // tonnes CO2 per mile
export const KM_PER_MILE = 1.60934;
export const EARTH_RADIUS_MI = 3958.8;  // mean Earth radius, for great-circle distance

// Private-jet cost (G650ER-class). Per-mile from the charter "wet" hourly (~$13k/hr,
// which already includes crew + fuel) ÷ ~540 mph; per-leg = landing + FBO/handling +
// customs (charter rates exclude these).
export const COST_PER_MILE = 24;
export const LANDING_FEE = 4000;

// Animation tuning.
export const SPEED = 0.012;             // legs advanced per animation frame
export const PAUSE_FRAMES = 240;        // ~4s hold at each stop (60fps)
