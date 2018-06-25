run: grpc build up

ssh:
	docker exec -ti acl_app_1 /bin/bash

grpc:
	rm -f service/acl_pb2*.py
	python -m grpc_tools.protoc -Iprotos --python_out=service --grpc_python_out=service protos/acl.proto

# ------------------DOCKER-COMPOSE------------------

build:
	docker-compose build

up:
	docker-compose -p acl up -d

stop:
	docker-compose -p acl stop

logs:
	docker-compose -p acl logs

kill: stop
	docker-compose -p acl rm

# ----------------END DOCKER-COMPOSE----------------
