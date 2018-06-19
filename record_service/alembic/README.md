## Usage:

```
cd record_service/
make # This starts the db
alembic upgrade head
```

To verify:
```
docker ps # find the container id for postgres
docker exec -it ${container_id} /bin/bash

psql -Upostgres -dmedfs
\dt
```
