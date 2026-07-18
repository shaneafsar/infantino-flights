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

## License

Released under the [MIT License](LICENSE).
