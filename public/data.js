// Itinerary + content data. No logic, no DOM.

// Each stop: city, stadium coords (lon/lat), stadium name (v), date, match, team
// flags (f1/f2). The Miami summit has no flags (not a match). Repeat cities reuse
// identical coords so the map dedupes their marker + label.
export const stops = [
  {n:"Mexico City",lon:-99.1504,lat:19.3030,v:"Estadio Azteca",date:"Jun 11",match:"Mexico 2–0 South Africa",f1:"🇲🇽",f2:"🇿🇦",note:"opener"},
  {n:"Guadalajara",lon:-103.4625,lat:20.6819,v:"Estadio Akron",date:"Jun 11",match:"South Korea 2–1 Czechia",f1:"🇰🇷",f2:"🇨🇿"},
  {n:"Los Angeles",lon:-118.3392,lat:33.9535,v:"SoFi Stadium",date:"Jun 12",match:"USA 4–1 Paraguay",f1:"🇺🇸",f2:"🇵🇾"},
  {n:"San Francisco",lon:-121.9694,lat:37.4033,v:"Levi's Stadium",date:"Jun 13",match:"Qatar 1–1 Switzerland",f1:"🇶🇦",f2:"🇨🇭"},
  {n:"Vancouver",lon:-123.1119,lat:49.2767,v:"BC Place",date:"Jun 13",match:"Australia 2–0 Türkiye",f1:"🇦🇺",f2:"🇹🇷"},
  {n:"Miami",lon:-80.1300,lat:25.7906,date:"Jun 14",match:"FIFA Executive Football Summit",note:"Ritz-Carlton South Beach — no match"},
  {n:"Seattle",lon:-122.3316,lat:47.5952,v:"Lumen Field",date:"Jun 15",match:"Belgium 1–1 Egypt",f1:"🇧🇪",f2:"🇪🇬"},
  {n:"Los Angeles",lon:-118.3392,lat:33.9535,v:"SoFi Stadium",date:"Jun 15",match:"Iran 2–2 New Zealand",f1:"🇮🇷",f2:"🇳🇿"},
  {n:"Kansas City",lon:-94.4839,lat:39.0489,v:"Arrowhead Stadium",date:"Jun 16",match:"Argentina 3–0 Algeria",f1:"🇦🇷",f2:"🇩🇿"},
  {n:"Houston",lon:-95.4107,lat:29.6847,v:"NRG Stadium",date:"Jun 17",match:"Portugal 1–1 Congo DR",f1:"🇵🇹",f2:"🇨🇩"},
  {n:"Mexico City",lon:-99.1504,lat:19.3030,v:"Estadio Azteca",date:"Jun 17",match:"Colombia 3–1 Uzbekistan",f1:"🇨🇴",f2:"🇺🇿"},
  {n:"Vancouver",lon:-123.1119,lat:49.2767,v:"BC Place",date:"Jun 18",match:"Canada 6–0 Qatar",f1:"🇨🇦",f2:"🇶🇦"},
  {n:"Boston",lon:-71.2643,lat:42.0909,v:"Gillette Stadium",date:"Jun 19",match:"Scotland 0–1 Morocco",f1:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",f2:"🇲🇦"},
  {n:"Houston",lon:-95.4107,lat:29.6847,v:"NRG Stadium",date:"Jun 20",match:"Netherlands 5–1 Sweden",f1:"🇳🇱",f2:"🇸🇪"},
  {n:"Monterrey",lon:-100.2447,lat:25.6692,v:"Estadio BBVA",date:"Jun 20",match:"Japan 4–0 Tunisia",f1:"🇯🇵",f2:"🇹🇳"},
  {n:"Atlanta",lon:-84.4008,lat:33.7554,v:"Mercedes-Benz Stadium",date:"Jun 21",match:"Spain 4–0 Saudi Arabia",f1:"🇪🇸",f2:"🇸🇦"},
  {n:"Miami",lon:-80.1300,lat:25.7906,v:"Hard Rock Stadium",date:"Jun 21",match:"Uruguay 2–2 Cape Verde",f1:"🇺🇾",f2:"🇨🇻"},
  {n:"Dallas",lon:-97.0945,lat:32.7473,v:"AT&T Stadium",date:"Jun 22",match:"Argentina 2–0 Austria",f1:"🇦🇷",f2:"🇦🇹"},
  {n:"Philadelphia",lon:-75.1675,lat:39.9008,v:"Lincoln Financial Field",date:"Jun 22",match:"France vs Iraq",note:"in progress",f1:"🇫🇷",f2:"🇮🇶"}
];

// Great-circle miles for each leg between consecutive stops (length = stops - 1).
export const legMiles = [296,1291,313,822,2804,2732,966,1367,649,755,2459,2501,1592,405,1101,607,1128,1313];
export const totalMiles = legMiles.reduce((a, b) => a + b, 0);

// CO2 milestones: cumulative tonnes -> relatable comparison shown as the plane flies.
export const co2Steps = [
  {t:1,m:"That&rsquo;s enough to charge 100,000 smartphones"},
  {t:4.7,m:"That&rsquo;s more than one person&rsquo;s yearly carbon footprint (global avg)"},
  {t:8,m:"That&rsquo;s what a gas car emits in ~2 years"},
  {t:15,m:"That&rsquo;s more than the average American emits in a year"},
  {t:25,m:"That&rsquo;s what ~1,100 trees absorb in a year"},
  {t:32,m:"That&rsquo;s enough to power a home for ~4 years"},
  {t:43,m:"That&rsquo;s ~3 Americans&rsquo; yearly footprint &mdash; or ~2,000 trees for a year"},
  {t:50,m:"That&rsquo;s a year of carbon for ~11 people worldwide"},
  {t:58,m:"That&rsquo;s a gas car driven ~150,000 miles &mdash; and flying emits ~7&times; more per mile"},
  {t:64,m:"That&rsquo;s ~4 Americans&rsquo; entire yearly carbon footprint"}
];
