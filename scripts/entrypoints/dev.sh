#!/bin/bash

node watcher.js&
npx start-storybook -p 8081 -c configs/storybook \
  -s dist/common,dist/blizko,dist/lookmart,dist/pulscen \
  --ci;
