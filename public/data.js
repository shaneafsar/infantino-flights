// Itinerary + content data. No logic, no DOM.

// When the itinerary above was last revised (ISO 8601 with offset). Bump this
// whenever stops/scores change; it's surfaced in the footer as "data last updated".
export const dataUpdated = "2026-07-20T13:20:00-04:00";

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
// Goal: link to evidence Infantino was actually THERE (not just that the match happened).
// Priority: a Reuters wire photo of him → a named article about him at that event (FIFA /
// AP / national press) → the Instagram post/reel of him that ESPN's tour overview embeds
// as its own evidence for that day (extracted so we skip the ad-heavy overview page).
// Three second-of-a-two-game-day stops (Jun 21 Atlanta, Jun 22 New York, Jun 26 Seattle)
// have no dedicated photo/article of him we could find, so they fall back to the ESPN
// match page. Every URL was seen in a search result, extracted
// from the ESPN article's embeds, or provided by the user — none are invented. (The IG
// shortcodes decode to a strictly chronological sequence, confirming they're genuine.)
export const stopSources = {
  "jun-11-mexico-city": "https://www.instagram.com/reel/DZeOaAPo0IO/",
  "jun-11-guadalajara": "https://www.instagram.com/reel/DZensYsAzQJ/",
  "jun-12-los-angeles": "https://www.instagram.com/p/DZiLYF5HJ0h/",
  "jun-13-san-francisco": "https://www.instagram.com/reel/DZi70JaAwVV/",
  "jun-13-vancouver": "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/australia-turkiye-highlights-match-report",
  "jun-14-miami": "https://inside.fifa.com/news/member-associations-miami-future-global-game",
  "jun-15-seattle": "https://www.instagram.com/reel/DZoFts7gksk/",
  "jun-15-los-angeles": "https://www.instagram.com/reel/DZpjL3dABZq/",
  "jun-16-kansas-city": "https://www.instagram.com/reel/DZrULX9oxkW/",
  "jun-17-houston": "https://www.instagram.com/reel/DZtCdrXoyKX/",
  "jun-17-mexico-city": "https://www.infobae.com/colombia/deportes/2026/06/19/el-presidente-de-la-fifa-gianni-infantino-se-refirio-a-la-aficion-de-colombia-en-el-mundial-2026-un-ambiente-increible/",
  "jun-18-vancouver": "https://www.instagram.com/reel/DZwLoi9It_X/",
  "jun-19-boston": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-c-scotland-v-morocco/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNkoxUEZBNUE",
  "jun-19-philadelphia": "https://www.instagram.com/reel/DZ0WLg7Avlk/",
  "jun-20-houston": "https://www.rte.ie/news/2026/0621/1579521-world-cup-infantino/",
  "jun-20-monterrey": "https://www.rte.ie/news/2026/0621/1579521-world-cup-infantino/",
  "jun-21-atlanta": "https://www.espn.com/soccer/match/_/gameId/760453/saudi-arabia-spain",
  "jun-21-miami": "https://www.instagram.com/reel/DZ3gbt4AAEY/",
  "jun-22-philadelphia": "https://www.instagram.com/p/DZ6elV4iEUI/",
  "jun-22-new-york": "https://www.espn.com/soccer/match/_/gameId/760454/senegal-norway",
  "jun-23-boston": "https://www.instagram.com/p/DZ8mmnOAUME/",
  "jun-23-toronto": "https://www.instagram.com/reel/DZ9NWGvgDF0/",
  "jun-24-miami": "https://www.reutersconnect.com/item/fifa-world-cup-2026-group-c-scotland-v-brazil/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNk8xUjE1UTg",
  "jun-25-philadelphia": "https://www.voetbalprimeur.nl/nieuws/2105051/curacao-uitgeschakeld-op-het-wk.html",
  "jun-26-seattle": "https://www.espn.com/soccer/match/_/gameId/760476/iran-egypt",
  "jun-26-dallas": "https://petra.gov.jo/en/news/fifa-president-praises-jordans-world-cup-performance",
  "jun-27-miami": "https://sports.yahoo.com/articles/marco-rubio-kash-patel-attend-234137500.html",
  "jun-28-los-angeles": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-32-south-africa-v-canada/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNlMxSEFVRko",
  "jun-29-houston": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-32-brazil-v-japan/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNlQxQkxWQ1A",
  "jun-29-monterrey": "https://www.aljazeera.com/video/newsfeed/2026/7/2/fifa-president-reacts-as-morocco-win-world-cup-match",
  "jun-30-dallas": "https://www.instagram.com/p/DaOJenBg2Jy/",
  "jun-30-mexico-city": "https://bolavip.com/en/world-cup/what-did-gianni-infantino-and-fans-chant-before-mexico-vs-ecuador-at-2026-world-cup",
  "jul-1-atlanta": "https://www.operationsports.com/fifa-president-gianni-infantino-believes-hydration-breaks-were-so-important-in-englands-win-against-dr-congo/",
  "jul-1-san-francisco": "https://www.instagram.com/reel/DaRwktcg0wb/",
  "jul-2-los-angeles": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-32-spain-v-austria/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNzIxR1c4MEI",
  "jul-2-vancouver": "https://www.swissinfo.ch/eng/various/football-guy-parmelin-supports-the-swiss-team-in-vancouver/91692151",
  "jul-3-miami": "https://www.reutersconnect.com/item/argentina-v-cape-verde-fifa-world-cup-2026-round-of-32/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMUFOQURMMDAwU0FGTkpL",
  "jul-4-houston": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-16-canada-v-morocco/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNzQxQkxOODQ",
  "jul-5-mexico-city": "https://www.instagram.com/reel/Dac-0-fABO0/",
  "jul-6-seattle": "https://www.reutersconnect.com/item/fifa-world-cup-2026-round-of-16-united-states-v-belgium/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNNzcwMkE1Mlc",
  "jul-7-vancouver": "https://www.espn.com/soccer/story/_/id/49300023/switzerland-colombia-world-cup-2026-penalty-shootout-argentina",
  "jul-9-new-york": "https://inside.fifa.com/news/final-four-world-cup-2026-matches-trionda-official-match-ball",
  "jul-9-boston": "https://www.instagram.com/reel/Dal-JdBISKO/",
  "jul-11-miami": "https://www.instagram.com/reel/DarWTkLIGAf/",
  "jul-13-doha": "https://www.insideworldfootball.com/2026/07/14/infantino-jets-to-doha-for-qatari-funeral-on-eve-of-world-cup-semis/",
  "jul-14-dallas": "https://www.reutersconnect.com/item/fifa-world-cup-2026-semi-final-france-v-spain/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNN0UxSFAwS1c",
  "jul-15-atlanta": "https://www.reutersconnect.com/item/fifa-world-cup-2026-semi-final-england-v-argentina/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX1VQMUVNN0YxSDJQVDM",
  "jul-16-new-york": "https://tennistonic.com/tennis-news/1028547/the-video-tyson-zlatan-and-infantino-join-djokovic-at-the-wolf-in-winter/",
  "jul-17-new-york": "https://apnews.com/article/gianni-infantino-fifa-world-cup-19d8d459c51e08047bfbfc60fddd9b2e",
  "jul-19-new-york": "https://www.euronews.com/video/2026/07/20/trump-and-infantino-hand-world-cup-trophy-to-spain",
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
