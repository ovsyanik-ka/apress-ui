#!/bin/bash

rm -rf node_modules;
rm -rf package-lock.json;
rm ./git/hooks/pre-commit;
cp scripts/hooks/* .git/hooks;
npm install;
