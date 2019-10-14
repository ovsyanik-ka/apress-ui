#!/bin/bash

rm -rf node_modules;
rm -rf package-lock.json;
cp scripts/hooks/* .git/hooks;
npm install;
