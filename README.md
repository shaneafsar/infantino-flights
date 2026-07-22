# Infantino's World Cup Flight Tour

A self-contained, pixel-art visualization of Gianni Infantino's World Cup flight tour — an animated SVG world map tracing the route city by city. Static files only, no build step.

## Project layout

```
public/
  index.html      # markup
  styles.css      # styles
  constants.js    # numeric constants (projection, emissions, animation)
  data.js         # host-city coords (CITIES), stops, CO2 milestones + projected route
  geo.js          # map outline data (Natural Earth)
  core.js         # pure logic — projection, distance, conversions (unit-tested)
  app.js          # view layer — builds the SVG map + runs the animation
  intro.js        # optional lazy-loaded arcade intro (with intro.css, arcade-*.webp, *.mp3)
scripts/
  stamp-updated.sh  # deploy: stamp "data last updated" from data.js's last commit
  cachebust.sh      # deploy: append ?v=<sha> to asset URLs
tests/
  unit/           # Jest — core logic + itinerary data integrity
  e2e/            # Playwright — browser behavior + responsive layout
```

The browser code is split into ES modules (`app.js` imports the rest), so it must be
served over HTTP — opening `index.html` via `file://` won't load the modules.

## On the map

- **Solid amber route** — the flown tour: confirmed sightings, animated stop by stop, driving the Miles / CO₂ / cost / games counters.
- **Dashed cyan route** — the *projected* onward route: the fixtures Infantino is expected to attend next, drawn from a separate `projected` array in `data.js`. It's an estimate only, so it never affects any of the counters. As each game happens, its leg is promoted from projected to a confirmed stop.

Every stop references its city by name; coordinates live once in the `CITIES` lookup in `data.js` (repeat visits share a coordinate and dedupe to one map marker). Non-game appearances (e.g. the FIFA summit / reception) are stops that add a flight leg but don't count as games.

There's also a hidden arcade intro: the small ✈ button in the footer lazy-loads a pixel-art penalty-kick cutscene.

## Share links

Link directly to a stop with `?stop=`:

- `?stop=jun-21-miami` — date-city slug (stable; survives inserting/reordering stops)
- `?stop=17` — 1-based stop number

The page opens paused on that stop. The **🔗 Share** button copies a slug link to whatever stop is on screen.

## Local preview

```sh
npx wrangler pages dev public                      # serves public/ like Cloudflare
# or any static server:
python3 -m http.server 5173 --directory public     # http://localhost:5173
```

## Tests

```sh
npm install            # one-time
npm test               # Jest unit tests (logic + data integrity)
npm run e2e:install    # one-time: download the Playwright browser
npm run e2e            # Playwright end-to-end tests (serves public/ automatically)
npm run test:all       # both suites
```

Both suites run in CI on every push and pull request, and **a deploy only happens if
they pass** (the `deploy` job `needs: test`).

## Deploy to Cloudflare

Hosted on the [Cloudflare Pages](https://developers.cloudflare.com/pages/) project `infantino-flights` at [infantino-flights.glup.dev](https://infantino-flights.glup.dev/) — `public/` is uploaded and served from the edge, no build step required.

### Automatic (CI)

Every push to `main` triggers `.github/workflows/deploy.yml`: it runs the Jest + Playwright suites, then — only if they pass — the `deploy` job checks out with full history and:

1. stamps the "data last updated" time from `data.js`'s last commit (`scripts/stamp-updated.sh`),
2. cache-busts asset URLs with the commit SHA (`scripts/cachebust.sh`),
3. deploys `public/` with `wrangler pages deploy` via [`cloudflare/wrangler-action`](https://github.com/cloudflare/wrangler-action).

No manual step needed. (These two scripts run only in CI, so local files are never rewritten.)

Requires two repo secrets:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | the Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | API token with **Account → Cloudflare Pages → Edit** |

### Manual (fallback)

```sh
npx wrangler pages deploy public --project-name=infantino-flights
```

The project name and asset directory are passed explicitly (same as CI). Prompts for auth if you aren't logged in (`npx wrangler login`).

## How our numbers compare

Two major outlets independently tallied Infantino's tour: the [AP flight-log analysis](https://apnews.com/article/gianni-infantino-private-jet-world-cup-9b299b0a1528cf687a77c0d5add3c5fc) and [ESPN's stop-by-stop tour overview](https://www.espn.com/soccer/story/_/id/49116383/infantino-fifa-presidents-epic-world-cup-tour). Here's how this site lines up against both.

| Metric | AP (flight-log analysis) | ESPN (tour overview) | This site |
| --- | --- | --- | --- |
| **Matches attended** | 44 | stop-by-stop (not tallied) | 44 |
| **Venues** | 16 (all) | all 16 | 16 |
| **Total miles** | 59,281 *(excl. Qatar)* | 67,507 *("over 65,000")* | 68,663 *(incl. Qatar)* |
| ↳ excl. Qatar detour | 59,281 | — | 53,079 |
| **Flight hours** | 115 + 29 (Qatar) | — | not modeled |
| **Most-visited** | Miami — 5 matches | Miami (Hard Rock) | Miami ×6 (5 + summit) |
| **Days with 2 matches** | 13 | "two-a-day" itinerary | 13 doubles |
| **Biggest single day** | Jun 26 — 5,772 mi (Mia→Dal→Sea→Mia) | Jun 26 | measures 2-*game* days only |
| **Jun 26 order** | Dallas → Seattle | Dallas → Seattle | Dallas → Seattle |
| **Airports / crossings** | 21 airports · 23 crossings | — | — |
| **Longest / shortest flight** | Mia→Sea 5h44m · Sea→Van 28m | — | — |
| **Doha detour** | ✅ (29 hrs) | ✅ | ✅ (15,584 mi) |
| **Aircraft** | Gulfstream G650 (Qatari fleet) | Qatar Airways private jet | noted, not a stat |
| **CO₂** | none published | none | 597.4 t (EPA-factor estimate) |
| **Cost** | none published | none | $1.84M (estimate) |

**Reading the mileage row** — the one place the three diverge. ESPN (67,507) and this site (68,663) are the close pair: both measure *point-to-point* distance between the places he actually appeared, including the Doha round trip (we're within ~1.7% of ESPN). AP (59,281) is a different ruler — it excludes the Qatar trip but counts *actual routed flight paths and empty repositioning legs* (hence 21 airports and 115 flight hours), so it isn't directly comparable. This site's excl-Qatar figure (53,079) is lower than AP's because we don't model deadhead legs — just straight-line great-circle arcs between attended stops.

CO₂ and cost are this site's own estimates (EPA equivalency factors; a per-mile + per-landing model) — neither AP nor ESPN publishes them. Conversely, AP's flight hours and repositioning legs aren't modeled here.

## License

Released under the [MIT License](LICENSE).
