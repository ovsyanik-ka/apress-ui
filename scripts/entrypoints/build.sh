#!/bin/bash

node run-fabler.js;
npx build-storybook -o docs -c configs/storybook \
  -s dist/common,dist/blizko,dist/lookmart,dist/pulscen;
