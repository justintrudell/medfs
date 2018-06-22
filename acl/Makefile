run: grpc build up

ssh:
	docker exec -ti record_service_app_1 /bin/bash

grpc:
	python -m grpc_tools.protoc -Iprotos --python_out=service --grpc_python_out=service protos/acl.proto

# ------------------DOCKER-COMPOSE------------------

build:
	docker-compose build

up:
	docker-compose -p acl_service up -d

stop:
	docker-compose -p acl_service stop

logs:
	docker-compose -p acl_service logs

kill: stop
	docker-compose -p acl_service rm

# ----------------END DOCKER-COMPOSE----------------
