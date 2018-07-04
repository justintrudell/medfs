run: grpc build up

ssh:
	docker exec -ti record_service_app_1 /bin/bash

grpc:
	python -m grpc_tools.protoc -I../acl/protos --python_out=record_service/api/acl --grpc_python_out=record_service/api/acl ../acl/protos/acl.proto

db:
	docker run -it --rm --net record_service_default --link record_service_db_1:postgres postgres sh -c 'PGPASSWORD=password exec psql -h postgres -U testuser -d local_record_service'

# ------------------DOCKER-COMPOSE------------------

build:
	docker-compose build

up:
	docker-compose -p record_service up -d

stop:
	docker-compose -p record_service stop

logs:
	docker-compose -p record_service logs

kill: stop
	docker-compose -p record_service rm

# ----------------END DOCKER-COMPOSE----------------
