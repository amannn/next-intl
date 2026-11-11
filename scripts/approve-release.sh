#!/bin/sh
# Approves the staged npm versions of a release and publishes its draft GitHub
# release. Needs `npm login` and `gh auth login`.
set -e

# Pick the versions to approve, one OTP for all
pnpm stage approve

tag=$(gh release list --json tagName,isDraft --jq 'map(select(.isDraft))[0].tagName')
gh release edit "$tag" --draft=false
