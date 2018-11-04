#!/bin/bash

# NOTE
# A lot of the logic in this script was taken from pouchDB's publish script
# https://github.com/pouchdb/pouchdb/blob/master/bin/release.sh

set -e

# Login (for this release session)
# Since this script will most likely run a different shell environment than your normal terminal
npm adduser

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
yarn build

log 'Prepare Modules for release...'
yarn update-modules

log 'Populate Modules folders...'
yarn populate-modules

# TODO
# We need a step to copy over relevant folders and files (eg: docs, license...)

log "Releasing them into the wild..."
for module in $(ls "${MODULES_PATH}"); do
  if [ ! -d "${MODULES_PATH}/$module" ]; then
    # We should not have random files laying around, but we might.
    # So we check for them
    continue
  fi
  cd "${MODULES_PATH}/$module/lib"
  # Get the current LOCAL package version
  CURRENT_VERSION=$(node -p "require('./package.json').version")
  # Check if that version is already published
  VERSION_PUBLISHED=$(npm view "@colony/$module@$CURRENT_VERSION" version)
  if [ $VERSION_PUBLISHED ]; then
    echo "@colony/$module @ $CURRENT_VERSION is already published, skipping"
    continue
  fi
  # If we're just testing, create a archive containing the release files, but don't push them
  if [ ! -z $JUST_A_TEST ]; then
    log "Packing @colony/$module @ $CURRENT_VERSION to NPM..."
    npm pack
  else
    # Do a RC release
    if [ $(echo $CURRENT_VERSION | grep "rc") ]; then
      log "Publishing @colony/$module @ $CURRENT_VERSION to NPM as RELEASE CANDIDATE"
      npm publish --access public --tag rc
    # Do a BETA release
    elif [ $(echo $CURRENT_VERSION | grep "beta") ]; then
      log "Publishing @colony/$module @ $CURRENT_VERSION to NPM as BETA"
      npm publish --access public --tag beta
    # DO an ALPHA release
    elif [ $(echo $CURRENT_VERSION | grep "alpha") ]; then
      log "Publishing @colony/$module @ $CURRENT_VERSION to NPM as ALPHA"
      npm publish --access public --tag alpha
    # DO a normal (LATEST) release
    else
      log "Publishing @colony/$module @ $CURRENT_VERSION to NPM"
      npm publish --access public
    fi
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
