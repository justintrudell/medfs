#!/bin/bash

cd config/deploy/

# Uncomment the lines below if you need to recreate the service. Otherwise ecs-cli throws a warning
core() {
    echo "Composing core"
    ecs-cli compose -f docker-compose.core.yml --project-name medfs-core service up \
        --cluster-config default \
        --launch-type FARGATE \
        # --container-name record_service \
        # --container-port 5000 \
        # --target-group-arn arn:aws:elasticloadbalancing:us-east-1:361641763854:targetgroup/medfs-core/0b6fc21eb62b8100 \ 

}

msg() {
    echo "Composing message service"
    ecs-cli compose -f docker-compose.message-srv.yml --project-name medfs-message service up \
       --cluster-config default \
       --launch-type FARGATE \
        # --container-name message_service \
        # --container-port 5004 \
        # --target-group-arn arn:aws:elasticloadbalancing:us-east-1:361641763854:targetgroup/medfs-message/06bc20ff6087f77b \
}

if [[ "$1" == "core" ]]; then 
    core
elif [[ "$1" == "msg" ]] ; then
    msg
else
    core
    msg
fi


