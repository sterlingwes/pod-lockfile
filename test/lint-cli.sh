#!/bin/bash

set -e

log_tag="test/lint-cli.sh:"
pod_version="1.14.3"
cd test/project

log () {
  echo "$log_tag $1"
}

assert_unknown_flag_fails() {
  set +e
  yarn pod-lockfile -v
  if [[ $? -eq 0 ]]; then
    log "Expected unknown flag to fail"
    exit 1
  else
    log "Unknown flag failed as expected"
  fi
}

assert_unknown_option_fails() {
  set +e
  yarn pod-lockfile --not-allowed
  if [[ $? -eq 0 ]]; then
    log "Expected unknown option to fail"
    exit 1
  else
    log "Unknown option failed as expected"
  fi
}

assert_help_prints() {
  set +e
  option_result=$(yarn pod-lockfile --help)
  if [[ $? -eq 1 ]]; then
    log "Expected help option not to exit with error"
    exit 1
  fi
  if [[ $option_result != *"Usage: pod-lockfile"* ]]; then
    log "Expected help option to print usage"
    exit 1
  fi

  flag_result=$(yarn pod-lockfile -h)
  if [[ $? -eq 1 ]]; then
    log "Expected help flag not to exit with error"
    exit 1
  fi
  if [[ $flag_result != *"Usage: pod-lockfile"* ]]; then
    log "Expected help flag to print usage"
    exit 1
  fi
}

assert_error_no_podfile() {
  set +e
  result=$(yarn pod-lockfile --pod-version "$pod_version" --project ../fixtures)
  if [[ $? -eq 0 ]]; then
    log "Expected error when Podfile is not found"
    exit 1
  fi
  if [[ $result != *"No Podfile could be found in"* ]]; then
    log "Expected error message when Podfile is not found, instead received:\n$result"
    exit 1
  fi
}

log "Running CLI lint tests ==============================="
log "You may see error outputs below, but they are expected"
log "======================================================"

log "assert_unknown_flag_fails"
assert_unknown_flag_fails
log "assert_unknown_option_fails"
assert_unknown_option_fails
log "assert_help_prints"
assert_help_prints
log "assert_error_no_podfile"
assert_error_no_podfile

log "CLI lint tests passed ================================"
echo ""
