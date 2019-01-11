#!/bin/bash

cd config/deploy/

echo "Composing"
ecs-cli compose --project-name medfs service up \
    --cluster-config default \
    --launch-type FARGATE \
    # Uncomment the lines below if you need to recreate the service. Otherwise ecs-cli throws a warning
    # --container-name record_service \
    # --container-port 5000 \
    # --target-group-arn arn:aws:elasticloadbalancing:us-east-1:361641763854:targetgroup/medfs/70ace18547f60eb7 \
