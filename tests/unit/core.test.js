import {
  proj, haversineMiles, milesToUnit, co2MilestoneIndex, gamesAttended, tripCost,
  stopSlug, stopIndexFromParam,
} from "../../public/core.js";
import { W, H, lonMin, lonMax, latMin, latMax, KM_PER_MILE, CO2_PER_MILE } from "../../public/constants.js";
import { stops, legMiles, totalMiles, co2Steps } from "../../public/data.js";

describe("itinerary data integrity", () => {
  test("31 stops, 30 legs", () => {
    expect(stops.length).toBe(31);
    expect(legMiles.length).toBe(stops.length - 1);
  });

  test("every stop has the required shape", () => {
    for (const s of stops) {
      expect(typeof s.n).toBe("string");
      expect(typeof s.lon).toBe("number");
      expect(typeof s.lat).toBe("number");
      expect(typeof s.date).toBe("string");
      expect(typeof s.match).toBe("string");
    }
  });

  test("match stops have two flags + a stadium; the summit has neither", () => {
    const summits = stops.filter(s => !s.f1);
    expect(summits).toHaveLength(1);
    expect(summits[0].n).toBe("Miami");
    expect(summits[0].note).toMatch(/no match/i);

    for (const s of stops.filter(s => s.f1)) {
      expect(typeof s.f2).toBe("string");
      expect(typeof s.v).toBe("string"); // stadium name
    }
  });

  test("all coordinates fall inside the projection viewport", () => {
    for (const s of stops) {
      expect(s.lon).toBeGreaterThanOrEqual(lonMin);
      expect(s.lon).toBeLessThanOrEqual(lonMax);
      expect(s.lat).toBeGreaterThanOrEqual(latMin);
      expect(s.lat).toBeLessThanOrEqual(latMax);
    }
  });

  test("repeat cities share identical coords so the map dedupes them", () => {
    const byName = {};
    for (const s of stops) (byName[s.n] ??= []).push(s);
    for (const list of Object.values(byName)) {
      const [first] = list;
      for (const s of list) {
        expect(s.lon).toBe(first.lon);
        expect(s.lat).toBe(first.lat);
      }
    }
    // sanity: at least one city really is visited more than once
    expect(Object.values(byName).some(l => l.length > 1)).toBe(true);
  });
});

describe("distances", () => {
  test("each legMiles matches the great-circle distance between its stops (±1%)", () => {
    for (let i = 0; i < legMiles.length; i++) {
      const a = stops[i], b = stops[i + 1];
      const gc = haversineMiles(a.lon, a.lat, b.lon, b.lat);
      expect(Math.abs(gc - legMiles[i]) / legMiles[i]).toBeLessThan(0.01);
    }
  });

  test("totalMiles is the sum of legs (~36,726)", () => {
    expect(totalMiles).toBe(legMiles.reduce((x, y) => x + y, 0));
    expect(totalMiles).toBeGreaterThan(35000);
    expect(totalMiles).toBeLessThan(38000);
  });
});

describe("unit conversion", () => {
  test("miles pass through, km scales by 1.60934", () => {
    expect(milesToUnit(100, "mi")).toBe(100);
    expect(milesToUnit(100, "km")).toBeCloseTo(160.934, 3);
    expect(milesToUnit(totalMiles, "km")).toBeCloseTo(totalMiles * KM_PER_MILE, 5);
  });
});

describe("flight cost", () => {
  test("two-part formula: $24/mile of air time + $4,000 per leg landed", () => {
    expect(tripCost(0, 0)).toBe(0);
    expect(tripCost(1000, 0)).toBe(24000);
    expect(tripCost(0, 3)).toBe(12000);
    expect(tripCost(1000, 2)).toBe(24000 + 8000);
  });

  test("full tour is ~$1.00M", () => {
    const cost = tripCost(totalMiles, legMiles.length);
    expect(cost).toBe(totalMiles * 24 + legMiles.length * 4000);
    expect(cost).toBeGreaterThan(950000);
    expect(cost).toBeLessThan(1060000);
  });
});

describe("projection", () => {
  test("maps the viewport corners to the SVG box", () => {
    expect(proj(lonMin, latMax)).toEqual([0, 0]);
    expect(proj(lonMax, latMin)).toEqual([W, H]);
  });
});

describe("CO2 model", () => {
  test("full tour is ~320 tonnes", () => {
    expect(totalMiles * CO2_PER_MILE).toBeCloseTo(319.5, 1);
  });

  test("milestone thresholds are strictly increasing", () => {
    for (let i = 1; i < co2Steps.length; i++) {
      expect(co2Steps[i].t).toBeGreaterThan(co2Steps[i - 1].t);
    }
  });

  test("co2MilestoneIndex picks the right tier at boundaries", () => {
    expect(co2MilestoneIndex(0)).toBe(-1);
    expect(co2MilestoneIndex(0.99)).toBe(-1);
    expect(co2MilestoneIndex(co2Steps[0].t)).toBe(0);
    expect(co2MilestoneIndex(co2Steps[1].t)).toBe(1);
    expect(co2MilestoneIndex(co2Steps[co2Steps.length - 1].t)).toBe(co2Steps.length - 1);
    expect(co2MilestoneIndex(1000)).toBe(co2Steps.length - 1);
  });
});

describe("share links", () => {
  test("every stop has a unique slug", () => {
    const slugs = stops.map(stopSlug);
    expect(new Set(slugs).size).toBe(stops.length);
    expect(slugs).toContain("jun-21-miami");
    expect(slugs).toContain("jun-19-boston");
  });

  test("resolves a slug to its stop index", () => {
    const i = stops.findIndex(s => s.n === "Boston");
    expect(stopIndexFromParam("jun-19-boston")).toBe(i);
    expect(stopIndexFromParam("JUN-19-BOSTON")).toBe(i); // case-insensitive
  });

  test("resolves a 1-based stop number", () => {
    expect(stopIndexFromParam("1")).toBe(0);
    expect(stopIndexFromParam(String(stops.length))).toBe(stops.length - 1);
  });

  test("rejects out-of-range numbers and unknown slugs", () => {
    expect(stopIndexFromParam("0")).toBe(-1);
    expect(stopIndexFromParam("999")).toBe(-1);
    expect(stopIndexFromParam("nope")).toBe(-1);
    expect(stopIndexFromParam("")).toBe(-1);
    expect(stopIndexFromParam(null)).toBe(-1);
  });
});

describe("games attended", () => {
  test("counts only matches; excludes the Miami summit", () => {
    const matchCount = stops.filter(s => s.f1).length;
    expect(gamesAttended(stops.length - 1)).toBe(matchCount);
    expect(matchCount).toBe(30);
  });

  test("accumulates as stops are reached", () => {
    expect(gamesAttended(0)).toBe(1);          // Mexico City opener
    expect(gamesAttended(4)).toBe(5);          // through Vancouver
    expect(gamesAttended(5)).toBe(5);          // Miami summit doesn't add
    expect(gamesAttended(6)).toBe(6);          // Seattle
  });
});
