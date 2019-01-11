#!/bin/bash

$(aws ecr get-login --no-include-email --region us-east-1 --profile medfs)

echo "Tagging docker images..."
docker tag medfs_record_service:latest 361641763854.dkr.ecr.us-east-1.amazonaws.com/record_service:latest
docker tag medfs_acl_service:latest 361641763854.dkr.ecr.us-east-1.amazonaws.com/acl_service:latest
docker tag medfs_message_service:latest 361641763854.dkr.ecr.us-east-1.amazonaws.com/message_service:latest

echo "Pushing images..."
docker push 361641763854.dkr.ecr.us-east-1.amazonaws.com/record_service:latest 
docker push 361641763854.dkr.ecr.us-east-1.amazonaws.com/acl_service:latest
docker push 361641763854.dkr.ecr.us-east-1.amazonaws.com/message_service:latest
