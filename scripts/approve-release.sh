#!/bin/sh
# Approves the staged npm versions of a release and publishes its draft GitHub
# release. Needs `npm login` and `gh auth login`.
set -e

tag=$(gh release list --json tagName,isDraft --jq '[.[] | select(.isDraft)][0].tagName // empty')
[ -n "$tag" ] || { echo "No draft release found"; exit 1; }

echo "Draft release: $tag"
echo
pnpm stage list
echo
printf "Approve these versions and publish %s? [y/N] " "$tag"
read -r answer
[ "$answer" = y ] || { echo "Aborted"; exit 1; }

# Pick the versions to approve, one OTP for all
pnpm stage approve

# Fails if the versions of this release aren't live yet
npm view "next-intl@${tag#v}" version --prefer-online
gh release edit "$tag" --draft=false
