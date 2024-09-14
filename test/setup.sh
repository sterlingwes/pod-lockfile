#!/bin/bash

set -e

cd test
rm -rf project
mkdir project
cd project

yarn init -y
yarn add ../../
yarn pod-lockfile --version
