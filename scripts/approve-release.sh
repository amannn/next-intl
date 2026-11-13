#!/bin/sh
# Run manually after a release to approve the staged npm versions and publish
# the draft GitHub release, if there is one. Needs `npm login` and
# `gh auth login`. See https://github.com/amannn/next-intl/blob/main/CONTRIBUTORS.md#stable-releases
set -e

# Pick the versions to approve, one OTP for all
echo "The staged versions are listed below for confirmation. Select all of them:"
echo "packages depend on each other's new versions, so a partial selection breaks installs."
pnpm stage approve

# Only reached if approving succeeded (`set -e`)
for tag in $(gh release list --json tagName,isDraft --jq '.[] | select(.isDraft) | .tagName'); do
  gh release edit "$tag" --draft=false
done
