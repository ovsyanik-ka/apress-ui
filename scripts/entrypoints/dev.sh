#!/bin/bash

node watcher.js&
npx start-storybook -p 8080 -c configs/storybook --ci;
