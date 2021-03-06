all: grpc-acl grpc-rec build up

ssh-rec:
	docker exec -ti medfs_record_service_1 /bin/bash

ssh-acl:
	docker exec -ti medfs_acl_service_1 /bin/bash

ssh-msg:
	docker exec -ti medfs_message_service_1 /bin/bash

grpc-rec:
	mkdir -p record_service/protos/record_service/external/
	cp acl_service/protos/acl.proto record_service/protos/record_service/external/
	rm -f record_service/record_service/external/acl_pb2*
	python3 -m grpc_tools.protoc -I record_service/protos --python_out=record_service --grpc_python_out=record_service record_service/protos/record_service/external/acl.proto
	rm -rf record_service/protos

grpc-acl:
	rm -f acl_service/service/acl_pb2*.py
	python3 -m grpc_tools.protoc -I acl_service/protos --python_out=acl_service/service --grpc_python_out=acl_service/service acl_service/protos/acl.proto

grpc-bmk:
	mkdir -p benchmarking/protos/
	cp acl_service/protos/acl.proto benchmarking/protos/
	rm -f benchmarking/acl_pb2*
	python3 -m grpc_tools.protoc -I benchmarking/protos --python_out=benchmarking --grpc_python_out=benchmarking benchmarking/protos/acl.proto
	rm -rf benchmarking/protos

db:
	docker run -it --rm --net medfs_default --link medfs_record_service_db_1:postgres postgres sh -c 'PGPASSWORD=password exec psql -h postgres -U testuser -d local_record_service'

db-acl:
	docker run -it --rm --net medfs_default --link medfs_acl_service_db_1:postgres postgres sh -c 'PGPASSWORD=password exec psql -p 5433 -h postgres -U testuser -d local_acl_service'

db-rec-dump:
	docker exec -t medfs_record_service_db_1 pg_dump local_record_service -c --if-exists -U testuser > dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql

console-rec:
	docker exec -it medfs_record_service_1 python3 -i -m record_service.utils.console 
 
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
	docker-compose -f config/docker-compose.yml -p medfs rm -fv

start:
	docker-compose -f config/docker-compose.yml -p medfs up -d $(c)

# ----------------END DOCKER-COMPOSE----------------

push: grpc-acl grpc-rec build
	./config/push.sh

deploy:
	./config/deploy/deploy.sh

deploy-core:
	./config/deploy/deploy.sh core

deploy-msg:
	./config/deploy/deploy.sh msg 

# ----------------BENCHMARK-------------------------
benchmark: grpc-bmk
	python benchmarking/acl_bmk.py
# ----------------END BENCHMARK---------------------
