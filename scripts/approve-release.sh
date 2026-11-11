#!/usr/bin/env bash
# Approves the staged npm versions of a release and publishes its draft GitHub
# release. Needs `npm login` and `gh auth login`.
#
# Usage: pnpm release:approve [tag]  (defaults to the newest draft release)
set -euo pipefail

# Staged publishing needs npm >= 11.15.0
npm() { command npx --yes npm@12.2.2 "$@"; }

tag="${1:-$(gh release list --repo amannn/next-intl --limit 20 --json tagName,isDraft --jq '[.[] | select(.isDraft)][0].tagName // empty')}"
[ -n "$tag" ] || { echo "No draft release found"; exit 1; }
version="${tag#v}"

ids=()
# Dependencies first
for dir in icu-minify use-intl swc-plugin-extractor next-intl; do
  manifest=$(gh api "repos/amannn/next-intl/contents/packages/$dir/package.json?ref=$tag" --jq .content | base64 --decode)
  name=$(node -p 'JSON.parse(process.argv[1]).name' "$manifest")
  # Packages that weren't bumped aren't part of the release
  [ "$(node -p 'JSON.parse(process.argv[1]).version' "$manifest")" = "$version" ] || continue
  if [ "$(npm view "$name@$version" version 2>/dev/null || true)" = "$version" ]; then
    echo "$name@$version is already published"
    continue
  fi
  id=$(npm stage list "$name" --json | node -e '
    const items = JSON.parse(require("fs").readFileSync(0, "utf8"));
    const item = items.find((item) => item.version === process.argv[1]);
    if (item) console.log(item.id);
  ' "$version")
  [ -n "$id" ] || { echo "$name@$version is neither published nor staged"; exit 1; }
  echo "$name@$version is staged as $id"
  ids+=("$id")
done

if [ ${#ids[@]} -gt 0 ]; then
  read -rp "Approve ${#ids[@]} staged version(s) of $tag? [y/N] " answer
  [ "$answer" = y ] || exit 1
  # One OTP for all of them, unless 2FA happens in the browser
  read -rp "npm OTP (leave empty for browser 2FA): " otp
  for id in "${ids[@]}"; do
    npm stage approve "$id" ${otp:+--otp "$otp"}
  done
fi

gh release edit "$tag" --repo amannn/next-intl --draft=false
echo "Published https://github.com/amannn/next-intl/releases/tag/$tag"
