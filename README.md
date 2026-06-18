# Infantino's World Cup Flight Tour

A self-contained, pixel-art visualization of Gianni Infantino's World Cup flight tour — an animated SVG world map tracing the route city by city. Everything (markup, styles, JS) lives in a single static HTML file with no build step.

## Project layout

```
public/
  index.html      # the entire app
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

Deployed to the [Cloudflare Pages](https://developers.cloudflare.com/pages/) project `infantino-flights` — `public/` is uploaded and served from the edge, no build step required.

```sh
npx wrangler pages deploy
```

The project name and asset directory come from `wrangler.jsonc`. First deploy will prompt for Cloudflare auth if you aren't already logged in (`npx wrangler login`).
