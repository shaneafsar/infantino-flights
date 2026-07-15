// Itinerary + content data. No logic, no DOM.

// When the itinerary above was last revised (ISO 8601 with offset). Bump this
// whenever stops/scores change; it's surfaced in the footer as "data last updated".
export const dataUpdated = "2026-06-26T13:42:00-04:00";

// Stadium coordinates per host city as [lon, lat]. Every stop and projected
// fixture references its city by name, so repeat visits share one coordinate
// pair (and dedupe to a single dot + label on the map). Add a city here once.
export const CITIES = {
  "Mexico City":   [-99.1504, 19.3030],
  "Guadalajara":   [-103.4625, 20.6819],
  "Los Angeles":   [-118.3392, 33.9535],
  "San Francisco": [-121.9694, 37.4033],
  "Vancouver":     [-123.1119, 49.2767],
  "Miami":         [-80.1300, 25.7906],
  "Seattle":       [-122.3316, 47.5952],
  "Kansas City":   [-94.4839, 39.0489],
  "Houston":       [-95.4107, 29.6847],
  "Boston":        [-71.2643, 42.0909],
  "Monterrey":     [-100.2447, 25.6692],
  "Atlanta":       [-84.4008, 33.7554],
  "Dallas":        [-97.0945, 32.7473],
  "Philadelphia":  [-75.1675, 39.9008],
  "New York":      [-74.0745, 40.8135],
  "Toronto":       [-79.4185, 43.6332],
};

// Attach a city's coordinates to a stop/projected entry (throws on a typo'd name).
const withCoords = s => {
  const c = CITIES[s.n];
  if (!c) throw new Error("Unknown city in data.js: " + s.n);
  return { ...s, lon: c[0], lat: c[1] };
};

// Each stop: city (n, resolves to coords via CITIES), stadium name (v), date,
// match, team flags (f1/f2). The Miami summit has no flags (not a match).
export const stops = [
  {n:"Mexico City",v:"Estadio Azteca",date:"Jun 11",match:"Mexico 2–0 South Africa",f1:"🇲🇽",f2:"🇿🇦",note:"opener"},
  {n:"Guadalajara",v:"Estadio Akron",date:"Jun 11",match:"South Korea 2–1 Czechia",f1:"🇰🇷",f2:"🇨🇿"},
  {n:"Los Angeles",v:"SoFi Stadium",date:"Jun 12",match:"USA 4–1 Paraguay",f1:"🇺🇸",f2:"🇵🇾"},
  {n:"San Francisco",v:"Levi's Stadium",date:"Jun 13",match:"Qatar 1–1 Switzerland",f1:"🇶🇦",f2:"🇨🇭"},
  {n:"Vancouver",v:"BC Place",date:"Jun 13",match:"Australia 2–0 Türkiye",f1:"🇦🇺",f2:"🇹🇷"},
  {n:"Miami",date:"Jun 14",match:"FIFA Executive Football Summit",note:"Ritz-Carlton South Beach — no match"},
  {n:"Seattle",v:"Lumen Field",date:"Jun 15",match:"Belgium 1–1 Egypt",f1:"🇧🇪",f2:"🇪🇬"},
  {n:"Los Angeles",v:"SoFi Stadium",date:"Jun 15",match:"Iran 2–2 New Zealand",f1:"🇮🇷",f2:"🇳🇿"},
  {n:"Kansas City",v:"Arrowhead Stadium",date:"Jun 16",match:"Argentina 3–0 Algeria",f1:"🇦🇷",f2:"🇩🇿"},
  {n:"Houston",v:"NRG Stadium",date:"Jun 17",match:"Portugal 1–1 Congo DR",f1:"🇵🇹",f2:"🇨🇩"},
  {n:"Mexico City",v:"Estadio Azteca",date:"Jun 17",match:"Colombia 3–1 Uzbekistan",f1:"🇨🇴",f2:"🇺🇿"},
  {n:"Vancouver",v:"BC Place",date:"Jun 18",match:"Canada 6–0 Qatar",f1:"🇨🇦",f2:"🇶🇦"},
  {n:"Boston",v:"Gillette Stadium",date:"Jun 19",match:"Scotland 0–1 Morocco",f1:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",f2:"🇲🇦"},
  {n:"Houston",v:"NRG Stadium",date:"Jun 20",match:"Netherlands 5–1 Sweden",f1:"🇳🇱",f2:"🇸🇪"},
  {n:"Monterrey",v:"Estadio BBVA",date:"Jun 20",match:"Japan 4–0 Tunisia",f1:"🇯🇵",f2:"🇹🇳"},
  {n:"Atlanta",v:"Mercedes-Benz Stadium",date:"Jun 21",match:"Spain 4–0 Saudi Arabia",f1:"🇪🇸",f2:"🇸🇦"},
  {n:"Miami",v:"Hard Rock Stadium",date:"Jun 21",match:"Uruguay 2–2 Cape Verde",f1:"🇺🇾",f2:"🇨🇻"},
  {n:"Dallas",v:"AT&T Stadium",date:"Jun 22",match:"Argentina 2–0 Austria",f1:"🇦🇷",f2:"🇦🇹"},
  {n:"Philadelphia",v:"Lincoln Financial Field",date:"Jun 22",match:"France 3–0 Iraq",f1:"🇫🇷",f2:"🇮🇶"},
  {n:"New York",v:"MetLife Stadium",date:"Jun 22",match:"Norway 3–2 Senegal",f1:"🇳🇴",f2:"🇸🇳"},
  {n:"Boston",v:"Gillette Stadium",date:"Jun 23",match:"England 0–0 Ghana",f1:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",f2:"🇬🇭"},
  {n:"Toronto",v:"BMO Field",date:"Jun 23",match:"Croatia 1–0 Panama",f1:"🇭🇷",f2:"🇵🇦"},
  {n:"Miami",v:"Hard Rock Stadium",date:"Jun 24",match:"Scotland 0–3 Brazil",f1:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",f2:"🇧🇷"},
  {n:"Philadelphia",v:"Lincoln Financial Field",date:"Jun 25",match:"Curaçao 0–2 Ivory Coast",f1:"🇨🇼",f2:"🇨🇮"},
  {n:"Seattle",v:"Lumen Field",date:"Jun 26",match:"Egypt 1–1 Iran",f1:"🇪🇬",f2:"🇮🇷"},
  {n:"Miami",v:"Hard Rock Stadium",date:"Jun 27",match:"Colombia 0–0 Portugal",f1:"🇨🇴",f2:"🇵🇹"},
  {n:"Los Angeles",v:"SoFi Stadium",date:"Jun 28",match:"South Africa 0–1 Canada",f1:"🇿🇦",f2:"🇨🇦",note:"Round of 32"},
  {n:"Houston",v:"NRG Stadium",date:"Jun 29",match:"Brazil 2–1 Japan",f1:"🇧🇷",f2:"🇯🇵",note:"Round of 32"},
  {n:"Monterrey",v:"Estadio BBVA",date:"Jun 29",match:"Netherlands 1–1 Morocco",f1:"🇳🇱",f2:"🇲🇦",note:"Round of 32 · Morocco 3–2 pens"},
  {n:"Dallas",v:"AT&T Stadium",date:"Jun 30",match:"Ivory Coast 1–2 Norway",f1:"🇨🇮",f2:"🇳🇴",note:"Round of 32"},
  {n:"Mexico City",v:"Estadio Azteca",date:"Jul 1",match:"Mexico 2–0 Ecuador",f1:"🇲🇽",f2:"🇪🇨",note:"Round of 32"},
  {n:"San Francisco",v:"Levi's Stadium",date:"Jul 1",match:"USA 2–0 Bosnia & Herzegovina",f1:"🇺🇸",f2:"🇧🇦",note:"Round of 32"},
  {n:"Los Angeles",v:"SoFi Stadium",date:"Jul 2",match:"Spain 3–0 Austria",f1:"🇪🇸",f2:"🇦🇹",note:"Round of 32"},
  {n:"Miami",v:"Hard Rock Stadium",date:"Jul 3",match:"Argentina 3–2 Cape Verde",f1:"🇦🇷",f2:"🇨🇻",note:"Round of 32 · a.e.t."},
  {n:"Houston",v:"NRG Stadium",date:"Jul 4",match:"Canada 0–3 Morocco",f1:"🇨🇦",f2:"🇲🇦",note:"Round of 16"},
  {n:"Mexico City",v:"Estadio Azteca",date:"Jul 5",match:"Mexico 2–3 England",f1:"🇲🇽",f2:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",note:"Round of 16"},
  {n:"Seattle",v:"Lumen Field",date:"Jul 6",match:"USA 1–4 Belgium",f1:"🇺🇸",f2:"🇧🇪",note:"Round of 16"},
  {n:"Vancouver",v:"BC Place",date:"Jul 7",match:"Switzerland 0–0 Colombia",f1:"🇨🇭",f2:"🇨🇴",note:"Round of 16 · Switzerland 4–3 pens"},
  {n:"Boston",v:"Gillette Stadium",date:"Jul 9",match:"France 2–0 Morocco",f1:"🇫🇷",f2:"🇲🇦",note:"Quarter-final"},
  {n:"Miami",v:"Hard Rock Stadium",date:"Jul 11",match:"Norway 1–2 England",f1:"🇳🇴",f2:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",note:"Quarter-final · a.e.t."},
  {n:"Dallas",v:"AT&T Stadium",date:"Jul 14",match:"France 0–2 Spain",f1:"🇫🇷",f2:"🇪🇸",note:"Semi-final"},
  {n:"Atlanta",v:"Mercedes-Benz Stadium",date:"Jul 15",match:"England 1–2 Argentina",f1:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",f2:"🇦🇷",note:"Semi-final · a.e.t."}
].map(withCoords);

// Great-circle miles for each leg between consecutive stops (length = stops - 1).
export const legMiles = [296,1291,313,822,2804,2732,966,1367,649,755,2459,2501,1592,405,1101,607,1128,1313,85,170,426,1234,1016,2375,2733,2343,1375,405,525,938,1858,314,2343,972,755,2348,122,2502,1234,1128,736];
export const totalMiles = legMiles.reduce((a, b) => a + b, 0);

// CO2 milestones: cumulative tonnes -> relatable comparison shown as the plane flies.
export const co2Steps = [
  {t:1,m:"That&rsquo;s enough to charge 100,000 smartphones"},
  {t:5,m:"That&rsquo;s more than one person&rsquo;s yearly carbon footprint (global avg)"},
  {t:15,m:"That&rsquo;s more than the average American emits in a year"},
  {t:22,m:"That&rsquo;s ~2,500 gallons of gasoline burned"},
  {t:40,m:"That&rsquo;s ~9 cars driven for a full year"},
  {t:60,m:"That&rsquo;s what ~2,700 trees absorb in a year"},
  {t:80,m:"That&rsquo;s a year of energy use for ~11 US homes"},
  {t:100,m:"That&rsquo;s ~230 barrels of oil burned"},
  {t:130,m:"That&rsquo;s ~54 tonnes of coal burned"},
  {t:160,m:"That&rsquo;s ~160 economy round-trips, New York to London"},
  {t:190,m:"That&rsquo;s enough to melt ~570 m&sup2; of Arctic summer sea ice"},
  {t:210,m:"That&rsquo;s a year of carbon for ~45 people worldwide"},
  {t:235,m:"That&rsquo;s ~51 cars driven for a full year"},
  {t:260,m:"That&rsquo;s what ~12,000 trees absorb in a year"},
  {t:290,m:"That&rsquo;s ~670 barrels of oil burned"},
  {t:300,m:"That&rsquo;s ~300 economy round-trips, New York to London"},
  {t:310,m:"That&rsquo;s ~22 Americans&rsquo; yearly carbon footprint"},
  {t:318,m:"That&rsquo;s enough to melt ~950 m&sup2; of Arctic summer sea ice"},
  {t:335,m:"That&rsquo;s a year of carbon for ~71 people worldwide"},
  {t:358,m:"That&rsquo;s a gas car driven ~890,000 miles"},
  {t:365,m:"That&rsquo;s the carbon of producing ~3.6 tonnes of beef"},
  {t:375,m:"That&rsquo;s enough CO2 gas to fill ~80 Olympic pools"},
  {t:388,m:"That&rsquo;s ~84 cars driven for a full year"},
  {t:400,m:"That&rsquo;s roughly one Falcon 9 rocket launch"},
  {t:405,m:"That&rsquo;s a year of energy use for ~56 US homes"},
  {t:415,m:"That&rsquo;s a year of carbon for ~88 people worldwide"},
  {t:430,m:"That&rsquo;s ~1,000 barrels of oil burned"},
  {t:435,m:"That&rsquo;s a gas car driven around the Earth ~43 times"},
  {t:450,m:"That&rsquo;s ~190 tonnes of coal burned"}
];

// Estimated onward route for the three fixtures left in the tournament, drawn as a
// dashed "projected" line from the last confirmed stop. NOT part of `stops`: these
// are expectations, not sightings, so they never affect miles / CO2 / cost / games.
// tag = short round badge shown on the map; date/venue mirror the FIFA schedule.
export const projected = [
  {n:"Miami",v:"Hard Rock Stadium",date:"Jul 18",tag:"3RD",round:"Third place",match:"Third-place play-off"},
  {n:"New York",v:"MetLife Stadium",date:"Jul 19",tag:"FINAL",round:"Final",match:"Spain vs winner of England/Argentina"}
].map(withCoords);
