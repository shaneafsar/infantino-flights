# Infantino's World Cup Flight Tour

A self-contained, pixel-art visualization of Gianni Infantino's World Cup flight tour — an animated SVG world map tracing the route city by city. Everything (markup, styles, JS) lives in a single static HTML file with no build step.

## Project layout

```
public/
  index.html      # the entire app
wrangler.jsonc    # Cloudflare Workers static-assets config
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

Deployed as a [Cloudflare Workers static-assets](https://developers.cloudflare.com/workers/static-assets/) site — `public/` is uploaded and served from the edge, no Worker script required.

```sh
npx wrangler deploy
```

The Worker is named `infantino-flights` (see `wrangler.jsonc`). First deploy will prompt for Cloudflare auth if you aren't already logged in (`npx wrangler login`).
