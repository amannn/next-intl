#!/bin/sh
# Creates a draft GitHub release per tag (e.g. `use-intl@4.15.1`), with the
# package's changelog entry as notes.
set -e

for tag in "$@"; do
  name=${tag%@*}
  version=${tag##*@}
  dir=$(dirname "$(grep -l "\"name\": \"$name\"" packages/*/package.json)")
  awk -v heading="## $version" '$0 == heading {found=1; next} /^## / {found=0} found' "$dir/CHANGELOG.md" > notes.md
  gh release create "$tag" --draft --verify-tag --title "$tag" --notes-file notes.md
done
rm -f notes.md
