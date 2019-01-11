#!/bin/bash

cd config/deploy/

echo "Composing"
ecs-cli compose --project-name medfs service up \
    --cluster-config default \
    --launch-type FARGATE \
