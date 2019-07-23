# !/bin/bash

docker-compose -f configs/npm-script.compose.yml up --exit-code-from node;
