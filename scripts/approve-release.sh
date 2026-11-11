#!/bin/sh
# Approves the staged npm versions of a release and publishes its draft GitHub
# release. Needs `npm login` and `gh auth login`.
set -e

# Pick the versions to approve, one OTP for all. `pnpm stage` needs pnpm 12.
npm_config_manage_package_manager_versions=false npx --yes pnpm@12.18.0 stage approve

tag=$(gh release list --json tagName,isDraft --jq 'map(select(.isDraft))[0].tagName')
gh release edit "$tag" --draft=false
