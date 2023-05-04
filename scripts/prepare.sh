#!/bin/bash

if [ "$CI" ]; then
  # Something is wrong with restoring cached outputs in CI.
  # Maybe related: https://github.com/vercel/turbo/issues/4137
  turbo run build --filter './packages/**' --force
else
  turbo run build --filter './packages/**'
fi
