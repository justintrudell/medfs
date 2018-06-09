run: build up

ssh:
	docker exec -ti record_service_app_1 /bin/bash

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