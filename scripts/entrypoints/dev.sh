#!/bin/bash

node watcher.js&
npx start-storybook -p 8081 -c configs/storybook --ci;
