#!/bin/bash

# NOTE
# A lot of the logic in this script was taken from pouchDB's publish script
# https://github.com/pouchdb/pouchdb/blob/master/bin/release.sh

set -e

# Paths
ROOT_PATH=$(pwd)
MODULES_PATH="${ROOT_PATH}/modules/node_modules/@colony"
NODE_MODULES_PATH="${ROOT_PATH}/node_modules"

# Git
INITIAL_BRANCH=$(git name-rev --name-only HEAD)
RELEASE_BRANCH="release_$$"


log() {
  # Colors
  GREEN='\033[0;32m'
  NC='\033[0m' # No Color
  # Weights
  BOLD='\033[1m'
  echo "${GREEN}${BOLD}$1${NC}"
}

log 'Creating a new branch...'
git checkout -b "${RELEASE_BRANCH}"

log 'Refresh Node Modules...'
rm -rf "${NODE_MODULES_PATH}"
yarn

log 'Build Modules...'
yarn build:test

log 'Prepare Modules for release...'
yarn update:test

log 'Populate Modules folders...'
yarn populate:test

# TODO
# We need a step to copy over relevant folders and files (eg: docs, license...)

log "Releasing them into the wild..."
for module in $(ls "${MODULES_PATH}"); do
  if [ ! -d "${MODULES_PATH}/$module" ]; then
    # We should not have random files laying around, but we might.
    # So we check for them
    continue
  fi
  cd "${MODULES_PATH}/$module"
  if [ ! -z $JUST_A_TEST ]; then
    log "Packing @colony/$module to NPM..."
    npm pack
  else
    log "Publishing @colony/$module to NPM..."
    # npm publish --access=public
  fi
  cd "${ROOT_PATH}"
done

if [ ! -z $JUST_A_TEST ]; then
  log "We're just testing, so we don't delete the changes, you'll have to do that manually..."
  continue
else
  log "Cleaning up..."
  git checkout -f
  git clean -fd "${MODULES_PATH}"
  git checkout "${INITIAL_BRANCH}"
  git branch -D "${RELEASE_BRANCH}"
fi
