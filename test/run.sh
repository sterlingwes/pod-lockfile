#!/bin/bash

set -e

fixture=$1
working_dir="test/fixtures/$fixture"
pod_version="1.14.3"
log_tag="test/run.sh:"

cd $working_dir

log () {
  echo "$log_tag $1"
}

log "===================================================="
log "Running lockfile snapshot tests for fixture $fixture"
log "===================================================="

log "Generating lockfile for test project in $working_dir"
node ../../project/node_modules/.bin/pod-lockfile --debug --pod-version "$pod_version"

set +e

cmp Podfile.lock.snapshot Podfile.lock

if [[ $? -ne 0 ]]; then
  log "Podfile.lock is not equal to Podfile.lock.snapshot"
  diff -u Podfile.lock.snapshot Podfile.lock
  exit 1
else
  log "Lockfiles are equal"
fi

log "Lockfile snapshot tests passed for fixture $fixture"
echo ""
