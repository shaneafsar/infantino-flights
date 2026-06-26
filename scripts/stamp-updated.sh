#!/usr/bin/env bash
# Stamp data.js's `dataUpdated` with the commit date of the LAST change to data.js,
# so the footer's "Data last updated" reflects real itinerary edits — not every deploy.
#
# %cI is the committer date in strict ISO 8601 with offset. The app formats it in
# US Eastern regardless of the stored offset, so a UTC commit (e.g. squash-merge)
# still displays correctly. Needs full git history (fetch-depth: 0) to find the
# commit; if no date is found, the committed fallback value is left untouched.
#
# Runs in CI just before `wrangler pages deploy`; the committed source stays clean.
set -euo pipefail

cd "$(dirname "$0")/../public"

TS="$(git log -1 --format=%cI -- data.js)"
if [ -z "$TS" ]; then
  echo "stamp-updated: no git date for data.js; leaving dataUpdated as-is"
  exit 0
fi

sed -i.bak -E "s#(export const dataUpdated = \")[^\"]*(\";)#\\1${TS}\\2#" data.js
rm -f ./*.bak
echo "stamped dataUpdated = ${TS}"
