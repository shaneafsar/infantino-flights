# Infantino's World Cup Flight Tour

A self-contained, pixel-art visualization of Gianni Infantino's World Cup flight tour — an animated SVG world map tracing the route city by city. Static files only, no build step.

## Project layout

```
public/
  index.html      # markup
  styles.css      # styles
  constants.js    # numeric constants (projection, emissions, animation)
  data.js         # itinerary stops + CO2 milestones
  geo.js          # map outline data (Natural Earth)
  core.js         # pure logic — projection, distance, conversions (unit-tested)
  app.js          # view layer — builds the SVG map + runs the animation
tests/
  unit/           # Jest — core logic + itinerary data integrity
  e2e/            # Playwright — browser behavior + responsive layout
wrangler.jsonc    # Cloudflare Pages config
```

The browser code is split into ES modules (`app.js` imports the rest), so it must be
served over HTTP — opening `index.html` via `file://` won't load the modules.

## Share links

Link directly to a stop with `?stop=`:

- `?stop=jun-21-miami` — date-city slug (stable; survives inserting/reordering stops)
- `?stop=17` — 1-based stop number

The page opens paused on that stop. The **🔗 Share** button copies a slug link to whatever stop is on screen.

## Local preview

```sh
npx wrangler dev                                   # serves public/ like Cloudflare
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

Hosted on the [Cloudflare Pages](https://developers.cloudflare.com/pages/) project `infantino-flights` — `public/` is uploaded and served from the edge, no build step required.

### Automatic (CI)

Every push to `main` triggers `.github/workflows/deploy.yml`: it runs the Jest + Playwright suites, then — only if they pass — runs `wrangler pages deploy` via [`cloudflare/wrangler-action`](https://github.com/cloudflare/wrangler-action). No manual step needed.

Requires two repo secrets:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | the Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | API token with **Account → Cloudflare Pages → Edit** |

### Manual (fallback)

```sh
npx wrangler pages deploy
```

The project name and asset directory come from `wrangler.jsonc`. Prompts for auth if you aren't logged in (`npx wrangler login`).

## License

Released under the [MIT License](LICENSE).
