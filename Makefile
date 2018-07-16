all: grpc-acl grpc-rec build up

ssh-rec:
	docker exec -ti medfs_record_service_1 /bin/bash

ssh-acl:
	docker-exec -ti medfs_acl_service_1 /bin/bash

ssh-msg:
	docker exec -ti medfs_message_service_1 /bin/bash

grpc-rec:
	mkdir -p record_service/protos/record_service/external/acl/
	cp acl/protos/acl.proto record_service/protos/record_service/external/acl/
	rm -f record_service/record_service/external/acl/acl_pb2*
	python3 -m grpc_tools.protoc -I record_service/protos --python_out=record_service --grpc_python_out=record_service record_service/protos/record_service/external/acl/acl.proto
	rm -rf record_service/protos

grpc-acl:
	rm -f acl/service/acl_pb2*.py
	python3 -m grpc_tools.protoc -I acl/protos --python_out=acl/service --grpc_python_out=acl/service acl/protos/acl.proto

db:
	docker run -it --rm --net medfs_default --link medfs_record_service_db_1:postgres postgres sh -c 'PGPASSWORD=password exec psql -h postgres -U testuser -d local_record_service'

# ------------------DOCKER-COMPOSE------------------

build:
	docker-compose -f config/docker-compose.yml -p medfs build

up:
	docker-compose -f config/docker-compose.yml -p medfs up -d

stop:
	docker-compose -f config/docker-compose.yml -p medfs stop

logs:
	docker-compose -f config/docker-compose.yml -p medfs logs

logs-f:
	docker-compose -f config/docker-compose.yml -p medfs logs -f

kill: stop
	docker-compose -f config/docker-compose.yml -p medfs rm 

start:
	docker-compose -f config/docker-compose.yml -p medfs up -d $(c)

# ----------------END DOCKER-COMPOSE----------------
