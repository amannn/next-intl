#!/bin/sh
# Run manually after a release to approve the staged npm versions and publish
# the draft GitHub releases (one per package). Needs `npm login` and
# `gh auth login`. See https://github.com/amannn/next-intl/blob/main/CONTRIBUTORS.md#stable-releases
set -e

tags=$(gh release list --json tagName,isDraft --jq '.[] | select(.isDraft) | .tagName')
[ -n "$tags" ] || { echo "No draft releases found"; exit 1; }
echo "Draft releases:"
echo "$tags"

# Pick the versions to approve, one OTP for all
pnpm stage approve

for tag in $tags; do
  gh release edit "$tag" --draft=false
done
