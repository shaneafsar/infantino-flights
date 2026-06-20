# Infantino's World Cup Flight Tour

A self-contained, pixel-art visualization of Gianni Infantino's World Cup flight tour — an animated SVG world map tracing the route city by city. Static files only, no build step.

## Project layout

```
public/
  index.html      # markup
  styles.css      # styles
  app.js          # itinerary data + map animation
wrangler.jsonc    # Cloudflare Pages config
```

## Local preview

Open the file directly:

```sh
open public/index.html
```

Or serve it through Wrangler exactly as Cloudflare will:

```sh
npx wrangler dev
```

## Deploy to Cloudflare

Hosted on the [Cloudflare Pages](https://developers.cloudflare.com/pages/) project `infantino-flights` — `public/` is uploaded and served from the edge, no build step required.

### Automatic (CI)

Every push to `main` triggers `.github/workflows/deploy.yml`, which runs `wrangler pages deploy` via [`cloudflare/wrangler-action`](https://github.com/cloudflare/wrangler-action). No manual step needed.

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
