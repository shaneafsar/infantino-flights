// Itinerary + content data. No logic, no DOM.

// When the itinerary or its evidence was last revised (ISO 8601 with offset).
// It's surfaced in the footer as "data last updated".
export const dataUpdated = "2026-07-22T00:35:38-04:00";

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
  // Off the North-America view (~51°E): a condolence detour to Qatar. Never plotted
  // on the main map — only in the world inset (see app.js) — but its real coordinates
  // drive the inset arc and the great-circle mileage of the two legs it adds.
  "Doha":          [51.5310, 25.2854],
};

// Attach a city's coordinates to a stop/projected entry (throws on a typo'd name).
const withCoords = s => {
  const c = CITIES[s.n];
  if (!c) throw new Error("Unknown city in data.js: " + s.n);
  return { ...s, lon: c[0], lat: c[1] };
};

// Each stop: city (n, resolves to coords via CITIES), stadium name (v), date,
// match, team flags (f1/f2). Non-game stops (the Miami summit, the New York
// reception, the Doha condolence visit) have no flags. `offMap:true` marks a stop
// outside the North-America view: it still counts toward miles/CO2/cost/itinerary,
// but the main map collapses it onto the prior city and shows it only in the inset.
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
  {n:"Philadelphia",v:"Lincoln Financial Field",date:"Jun 19",match:"Brazil 3–0 Haiti",f1:"🇧🇷",f2:"🇭🇹"},
  {n:"Houston",v:"NRG Stadium",date:"Jun 20",match:"Netherlands 5–1 Sweden",f1:"🇳🇱",f2:"🇸🇪"},
  {n:"Monterrey",v:"Estadio BBVA",date:"Jun 20",match:"Japan 4–0 Tunisia",f1:"🇯🇵",f2:"🇹🇳"},
  {n:"Atlanta",v:"Mercedes-Benz Stadium",date:"Jun 21",match:"Spain 4–0 Saudi Arabia",f1:"🇪🇸",f2:"🇸🇦"},
  {n:"Miami",v:"Hard Rock Stadium",date:"Jun 21",match:"Uruguay 2–2 Cape Verde",f1:"🇺🇾",f2:"🇨🇻"},
  {n:"Philadelphia",v:"Lincoln Financial Field",date:"Jun 22",match:"France 3–0 Iraq",f1:"🇫🇷",f2:"🇮🇶"},
  {n:"New York",v:"MetLife Stadium",date:"Jun 22",match:"Norway 3–2 Senegal",f1:"🇳🇴",f2:"🇸🇳"},
  {n:"Boston",v:"Gillette Stadium",date:"Jun 23",match:"England 0–0 Ghana",f1:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",f2:"🇬🇭"},
  {n:"Toronto",v:"BMO Field",date:"Jun 23",match:"Croatia 1–0 Panama",f1:"🇭🇷",f2:"🇵🇦"},
  {n:"Miami",v:"Hard Rock Stadium",date:"Jun 24",match:"Scotland 0–3 Brazil",f1:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",f2:"🇧🇷"},
  {n:"Philadelphia",v:"Lincoln Financial Field",date:"Jun 25",match:"Curaçao 0–2 Ivory Coast",f1:"🇨🇼",f2:"🇨🇮"},
  {n:"Seattle",v:"Lumen Field",date:"Jun 26",match:"Egypt 1–1 Iran",f1:"🇪🇬",f2:"🇮🇷"},
  {n:"Dallas",date:"Jun 26",match:"Farewell to Jordan's eliminated squad",note:"a send-off before their final match — no match"},
  {n:"Miami",v:"Hard Rock Stadium",date:"Jun 27",match:"Colombia 0–0 Portugal",f1:"🇨🇴",f2:"🇵🇹"},
  {n:"Los Angeles",v:"SoFi Stadium",date:"Jun 28",match:"South Africa 0–1 Canada",f1:"🇿🇦",f2:"🇨🇦",note:"Round of 32"},
  {n:"Houston",v:"NRG Stadium",date:"Jun 29",match:"Brazil 2–1 Japan",f1:"🇧🇷",f2:"🇯🇵",note:"Round of 32"},
  {n:"Monterrey",v:"Estadio BBVA",date:"Jun 29",match:"Netherlands 1–1 Morocco",f1:"🇳🇱",f2:"🇲🇦",note:"Round of 32 · Morocco 3–2 pens"},
  {n:"Dallas",v:"AT&T Stadium",date:"Jun 30",match:"Ivory Coast 1–2 Norway",f1:"🇨🇮",f2:"🇳🇴",note:"Round of 32"},
  {n:"Mexico City",v:"Estadio Azteca",date:"Jun 30",match:"Mexico 2–0 Ecuador",f1:"🇲🇽",f2:"🇪🇨",note:"Round of 32"},
  {n:"Atlanta",v:"Mercedes-Benz Stadium",date:"Jul 1",match:"England 2–1 Congo DR",f1:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",f2:"🇨🇩",note:"Round of 32"},
  {n:"San Francisco",v:"Levi's Stadium",date:"Jul 1",match:"USA 2–0 Bosnia & Herzegovina",f1:"🇺🇸",f2:"🇧🇦",note:"Round of 32"},
  {n:"Los Angeles",v:"SoFi Stadium",date:"Jul 2",match:"Spain 3–0 Austria",f1:"🇪🇸",f2:"🇦🇹",note:"Round of 32"},
  {n:"Vancouver",v:"BC Place",date:"Jul 2",match:"Switzerland 2–0 Algeria",f1:"🇨🇭",f2:"🇩🇿",note:"Round of 32"},
  {n:"Miami",v:"Hard Rock Stadium",date:"Jul 3",match:"Argentina 3–2 Cape Verde",f1:"🇦🇷",f2:"🇨🇻",note:"Round of 32 · a.e.t."},
  {n:"Houston",v:"NRG Stadium",date:"Jul 4",match:"Canada 0–3 Morocco",f1:"🇨🇦",f2:"🇲🇦",note:"Round of 16"},
  {n:"Mexico City",v:"Estadio Azteca",date:"Jul 5",match:"Mexico 2–3 England",f1:"🇲🇽",f2:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",note:"Round of 16"},
  {n:"Seattle",v:"Lumen Field",date:"Jul 6",match:"USA 1–4 Belgium",f1:"🇺🇸",f2:"🇧🇪",note:"Round of 16"},
  {n:"Vancouver",v:"BC Place",date:"Jul 7",match:"Switzerland 0–0 Colombia",f1:"🇨🇭",f2:"🇨🇴",note:"Round of 16 · Switzerland 4–3 pens"},
  {n:"New York",date:"Jul 9",match:"Adidas ‘Trionda’ match-ball unveiling",note:"MetLife Stadium — no match"},
  {n:"Boston",v:"Gillette Stadium",date:"Jul 9",match:"France 2–0 Morocco",f1:"🇫🇷",f2:"🇲🇦",note:"Quarter-final"},
  {n:"Miami",v:"Hard Rock Stadium",date:"Jul 11",match:"Norway 1–2 England",f1:"🇳🇴",f2:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",note:"Quarter-final · a.e.t."},
  {n:"Doha",date:"Jul 13",match:"Condolence visit to Qatar's Emir",offMap:true,note:"Lusail Palace — with Emir Sheikh Tamim bin Hamad Al Thani · no match"},
  {n:"Dallas",v:"AT&T Stadium",date:"Jul 14",match:"France 0–2 Spain",f1:"🇫🇷",f2:"🇪🇸",note:"Semi-final"},
  {n:"Atlanta",v:"Mercedes-Benz Stadium",date:"Jul 15",match:"England 1–2 Argentina",f1:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",f2:"🇦🇷",note:"Semi-final · a.e.t."},
  {n:"New York",date:"Jul 16",match:"‘The Wolf in Winter’ film premiere",note:"Novak Djokovic documentary — no match"},
  {n:"New York",date:"Jul 17",match:"FIFA World Cup Final reception",note:"Trump Tower — with President Trump · no match"},
  {n:"New York",v:"MetLife Stadium",date:"Jul 19",match:"Spain 1–0 Argentina",f1:"🇪🇸",f2:"🇦🇷",note:"Final · a.e.t."}
].map(withCoords);

// Per-stop source link, keyed by the stop's date+city slug (see stopSlug in core.js).
// Goal: link to evidence Infantino was actually THERE, not merely that the match happened.
// Priority, audited 2026-07-22: an exact-caption photo/video on Reuters Connect → AP → an
// official Instagram post/reel → an independently captioned photo → a report that expressly
// places him at the event. Reuters
// Connect links were checked for a caption naming Infantino, the event, city and date. The
// Instagram links are Infantino/FIFA posts embedded as evidence in ESPN's itinerary. A
// shared link backs two stops only when its media or text expressly covers both. The remaining
// ESPN overview fallback says he attended the particular stop; generic match pages do not.
export const stopSources = {
  "jun-11-mexico-city": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-a-mexico-v-south-africa/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNkIxSDc0STI",
  "jun-11-guadalajara": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-a-south-korea-v-czech-republic/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNkMwNjVINE8",
  "jun-12-los-angeles": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-d-united-states-v-paraguay/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNkQwMzRZN0k",
  "jun-13-san-francisco": "https://www.instagram.com/reel/DZi70JaAwVV/",
  "jun-13-vancouver": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-d-australia-v-turkey/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNkUwQlcyWVI",
  "jun-14-miami": "https://apnews.com/article/9b299b0a1528cf687a77c0d5add3c5fc",
  "jun-15-seattle": "https://apnews.com/article/9b299b0a1528cf687a77c0d5add3c5fc",
  "jun-15-los-angeles": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-g-iran-v-new-zealand/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNkcwN1NXRUc",
  "jun-16-kansas-city": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-j-argentina-v-algeria/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNkgwMzlEVDk",
  "jun-17-houston": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-k-portugal-v-dr-congo/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNkgxRlVGVEk",
  "jun-17-mexico-city": "https://www.gettyimages.com/detail/news-photo/colombian-football-federation-president-ramon-jesurun-fifa-news-photo/2281510658",
  "jun-18-vancouver": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-b-canada-v-qatar/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNkkxUElORE8",
  "jun-19-boston": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-c-scotland-v-morocco/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNkoxUEZBNUE",
  "jun-19-philadelphia": "https://www.instagram.com/reel/DZ0WLg7Avlk/",
  "jun-20-houston": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-f-netherlands-v-sweden/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNksxQkVKRDY",
  "jun-20-monterrey": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-f-tunisia-v-japan/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNkwwQk5EMFo",
  "jun-21-atlanta": "https://www.gettyimages.com/detail/news-photo/president-gianni-infantino-interacts-with-fans-during-the-news-photo/2282124372",
  "jun-21-miami": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-h-uruguay-v-cape-verde/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNkwxUE1RQjc",
  "jun-22-philadelphia": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-i-france-v-iraq/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNk0xTVQwVTA",
  "jun-22-new-york": "https://www.espn.com/soccer/story/_/id/49116383/infantino-fifa-presidents-epic-world-cup-tour",
  "jun-23-boston": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-l-england-v-ghana/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNk4xTTdHUFU",
  "jun-23-toronto": "https://www.instagram.com/reel/DZ9NWGvgDF0/",
  "jun-24-miami": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-c-scotland-v-brazil/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNk8xUjE1UTg",
  "jun-25-philadelphia": "https://www.instagram.com/reel/DaB7CQyMC4Z/",
  "jun-26-seattle": "https://apnews.com/article/9b299b0a1528cf687a77c0d5add3c5fc",
  "jun-26-dallas": "https://www.instagram.com/reel/DaEj45GsIUA/",
  "jun-27-miami": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-k-colombia-v-portugal/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNlIxVElKUkU",
  "jun-28-los-angeles": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-32-south-africa-v-canada/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNlMxSEFVRko",
  "jun-29-houston": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-32-brazil-v-japan/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNlQxQkxWQ1A",
  "jun-29-monterrey": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-32-netherlands-v-morocco/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNlUwMlhXMFY",
  "jun-30-dallas": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-32-ivory-coast-v-norway/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNlUxQ0ZKT0U",
  "jun-30-mexico-city": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-32-mexico-v-ecuador/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNzEwNjZYU0o",
  "jul-1-atlanta": "https://www.instagram.com/reel/DaRwktcg0wb/",
  "jul-1-san-francisco": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-32-united-states-v-bosnia-and-herzegovina/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNzIwNkdLNE8",
  "jul-2-los-angeles": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-32-spain-v-austria/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNzIxR1c4MEI",
  "jul-2-vancouver": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-32-switzerland-v-algeria/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNzMwQTVGNkI",
  "jul-3-miami": "https://www.reutersconnect.com/item/argentina-v-cape-verde-fifa-world-cup-2026-round-of-32/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMUFOQURMMDAwU0FGTkpL",
  "jul-4-houston": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-16-canada-v-morocco/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNzQxQkxOODQ",
  "jul-5-mexico-city": "https://www.instagram.com/reel/Dac-0-fABO0/",
  "jul-6-seattle": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-16-united-states-v-belgium/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNzcwMkE1Mlc",
  "jul-7-vancouver": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-16-switzerland-v-colombia/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNzcxSlBHQlg",
  "jul-9-new-york": "https://www.instagram.com/reel/Dal-JdBISKO/",
  "jul-9-boston": "https://www.reutersconnect.com/item/fifa-world-cup-2026-quarter-final-france-v-morocco/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNzkxTjg0R0U",
  "jul-11-miami": "https://www.reutersconnect.com/item/fifa-world-cup-2026-quarter-final-norway-v-england/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNN0IxTVBJUzA",
  "jul-13-doha": "https://www.reutersconnect.com/item/fifa-president-gianni-infantino-meets-qatars-emir-sheikh-tamim-bin-hamad-al-thani-at-lusail-palace-in-doha/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1JDMjNETUE1TUM0TA",
  "jul-14-dallas": "https://www.reutersconnect.com/item/fifa-world-cup-2026-semi-final-france-v-spain/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNN0UxSFAwS1c",
  "jul-15-atlanta": "https://www.reutersconnect.com/item/fifa-world-cup-2026-semi-final-england-v-argentina/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNN0YxSDJQVDM",
  "jul-16-new-york": "https://www.reutersconnect.com/item/new-york-premiere-of-novak-djokovic-the-wolf-in-winter/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMVNJUEEwMDBEQ0U0NlE",
  "jul-17-new-york": "https://www.reutersconnect.com/item/us-president-donald-trump-visits-new-york-city/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1JDMlhGTUFSTThYRQ",
  "jul-19-new-york": "https://www.reutersconnect.com/item/fifa-world-cup-2026-final-spain-v-argentina/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNN0oxREc0SUk",
};

// Great-circle miles for each leg between consecutive stops (length = stops - 1).
// The Miami→Doha (7,657) and Doha→Dallas (7,927) legs are the condolence detour —
// a ~15,600-mile round trip in 24 h. The two 0-mile legs at the end are same-city
// hops (the NY documentary/reception/final week, all at MetLife-area coords).
export const legMiles = [296,1291,314,822,2804,2733,965,1366,649,755,2459,2500,254,1343,405,1101,607,1016,85,170,426,1233,1016,2375,1669,1128,2343,1375,405,525,938,1349,2112,314,1086,2804,972,755,2348,122,2419,170,1234,7657,7927,736,747,0,0];
export const totalMiles = legMiles.reduce((a, b) => a + b, 0);

// CO2 milestones: cumulative metric tons -> relatable comparison shown as the plane flies.
export const co2Steps = [
  {t:1,m:"That&rsquo;s enough to charge 100,000 smartphones"},
  {t:5,m:"That&rsquo;s more than one person&rsquo;s yearly carbon footprint (global avg)"},
  {t:15,m:"That&rsquo;s more than the average American emits in a year"},
  {t:22,m:"That&rsquo;s ~2,500 gallons of gasoline burned"},
  {t:40,m:"That&rsquo;s ~9 cars driven for a full year"},
  {t:60,m:"That&rsquo;s what ~2,700 trees absorb in a year"},
  {t:80,m:"That&rsquo;s a year of energy use for ~11 US homes"},
  {t:100,m:"That&rsquo;s ~230 barrels of oil burned"},
  {t:130,m:"That&rsquo;s ~54 metric tons of coal burned"},
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
  {t:365,m:"That&rsquo;s the carbon of producing ~3.6 metric tons of beef"},
  {t:375,m:"That&rsquo;s enough CO2 gas to fill ~80 Olympic pools"},
  {t:388,m:"That&rsquo;s ~84 cars driven for a full year"},
  {t:400,m:"That&rsquo;s roughly one Falcon 9 rocket launch"},
  {t:405,m:"That&rsquo;s a year of energy use for ~56 US homes"},
  {t:415,m:"That&rsquo;s a year of carbon for ~88 people worldwide"},
  {t:430,m:"That&rsquo;s ~1,000 barrels of oil burned"},
  {t:435,m:"That&rsquo;s a gas car driven around the Earth ~43 times"},
  {t:450,m:"That&rsquo;s ~190 metric tons of coal burned"},
  {t:465,m:"That&rsquo;s ~465 economy round-trips, New York to London"},
  {t:480,m:"That&rsquo;s ~1,100 barrels of oil burned"},
  {t:500,m:"That&rsquo;s ~500 economy round-trips, New York to London"},
  {t:520,m:"That&rsquo;s ~215 metric tons of coal burned"},
  {t:540,m:"That&rsquo;s a year of energy use for ~75 US homes"},
  {t:560,m:"That&rsquo;s the entire yearly carbon footprint of ~120 people worldwide"},
  {t:575,m:"That&rsquo;s ~1,340 barrels of oil burned"},
  {t:590,m:"That&rsquo;s ~245 metric tons of coal burned"}
];

// Estimated onward route for the three fixtures left in the tournament, drawn as a
// dashed "projected" line from the last confirmed stop. NOT part of `stops`: these
// are expectations, not sightings, so they never affect miles / CO2 / cost / games.
// tag = short round badge shown on the map; date/venue mirror the FIFA schedule.
// Tour complete: the final (Jul 19) is now a confirmed stop, so nothing is projected.
export const projected = [].map(withCoords);
