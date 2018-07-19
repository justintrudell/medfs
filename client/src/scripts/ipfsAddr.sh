#!/bin/bash

DOCKER_ID=$(docker ps | grep ipfs | awk '{print $1}')
docker exec -t $DOCKER_ID ipfs id | jq -r '.Addresses[] | select(. | contains("127.0.0.1"))'
