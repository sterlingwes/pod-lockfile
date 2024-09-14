#!/bin/bash

set -e

fixture=$1
working_dir="test/fixtures/$fixture"
cd $working_dir

echo "Generating lockfile for test project in $working_dir"
node ../.bin/pod-lockfile --pod-version 1.14.3

set +e

cmp Podfile.lock.snapshot Podfile.lock

if [[ $? -ne 0 ]]; then
  echo "Podfile.lock is not equal to Podfile.lock.snapshot"
  diff -u Podfile.lock.snapshot Podfile.lock
  exit 1
else
  echo "Lockfiles are equal"
fi
