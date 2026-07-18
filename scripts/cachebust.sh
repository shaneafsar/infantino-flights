#!/usr/bin/env bash
# Append ?v=<version> to asset URLs so each deploy busts the browser cache.
#
# Cloudflare Pages serves index.html fresh (Cache-Control: no-cache) but serves
# .js/.css with max-age=14400 and ignores _headers Cache-Control for assets.
# So we version the URLs instead: the always-fresh HTML points at app.js?v=V,
# and the ES-module import specifiers (./*.js) are versioned too so the whole
# module graph (data.js, core.js, …) is re-fetched on a new deploy.
#
# Runs in CI just before `wrangler pages deploy`; the committed source stays clean.
set -euo pipefail

V="${1:-$(date +%s)}"
cd "$(dirname "$0")/../public"

# Version relative ES-module import specifiers inside the JS files.
for mod in constants data geo core; do
  sed -i.bak -E "s#(\"\\./${mod})\\.js\"#\\1.js?v=${V}\"#g" ./*.js
done

# Version the entry points referenced from index.html.
sed -i.bak -E "s#(src=\"app)\\.js\"#\\1.js?v=${V}\"#; s#(href=\"styles)\\.css\"#\\1.css?v=${V}\"#" index.html

# The arcade intro is lazy-loaded from JS (not index.html), so its module, stylesheet,
# sprite atlases and audio would otherwise stay cached across deploys. Version them too.
sed -i.bak -E "s#(import\\(\"\\./intro)\\.js\"#\\1.js?v=${V}\"#g; s#(\"\\./intro-title-theme)\\.mp3\"#\\1.mp3?v=${V}\"#g" app.js
sed -i.bak -E "s#(\"intro)\\.css\"#\\1.css?v=${V}\"#g; s#(\"arcade-[a-z-]+)\\.webp\"#\\1.webp?v=${V}\"#g" intro.js

rm -f ./*.bak
echo "cache-busted asset URLs with v=${V}"
