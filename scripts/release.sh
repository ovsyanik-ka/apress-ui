# !/bin/bash

sudo rm -rf docs/;
sudo rm -rf dist/;
npm install;
npm run build && npm publish && git add -A && git commit -a --no-verify;
