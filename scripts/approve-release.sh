#!/bin/sh
# Approves the staged npm versions of a release and publishes its draft GitHub
# releases (one per package). Needs `npm login` and `gh auth login`.
set -e

tags=$(gh release list --json tagName,isDraft --jq '.[] | select(.isDraft) | .tagName')
[ -n "$tags" ] || { echo "No draft releases found"; exit 1; }
echo "Draft releases:"
echo "$tags"

# Pick the versions to approve, one OTP for all
pnpm stage approve

for tag in $tags; do
  # Fails if this version isn't live yet
  npm view "$tag" version --prefer-online
  gh release edit "$tag" --draft=false
done
