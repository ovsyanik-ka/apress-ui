#!/bin/bash

node run-fabler.js;
npx build-storybook -o docs -c configs/storybook;
