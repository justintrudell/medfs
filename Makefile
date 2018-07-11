all: build up

ssh-rec:
	docker exec -ti medfs_record_service_1 /bin/bash

grpc-rec:
	python -m grpc_tools.protoc -Iacl/protos --python_out=record_service/record_service/api/acl --grpc_python_out=record_service/record_service/api/acl acl/protos/acl.proto

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

# ----------------END DOCKER-COMPOSE----------------
