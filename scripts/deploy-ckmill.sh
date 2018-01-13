#!/bin/bash

syncImage="`whoami`/ckmill_sync:latest"
autobirtherImage="`whoami`/ckmill_autobirther:latest"

docker pull $syncImage
docker pull $autobirtherImage

cat -> /tmp/docker-compose.yml <<EOF
version: '3.4'

secrets:
  postgres:
    external: true

volumes:
  postgres:
  ethprovider_ipc:
    external: true

networks:
  back:

services:

  autobirther:
    image: $autobirtherImage
    deploy:
      mode: global
    depends_on:
      - postgres
    secrets:
      - postgres
    environment:
      - ETH_ADDRESS
      - PGHOST=postgres
      - PGPORT=5432
      - PGUSER=ckmill
      - PGDATABASE=ckmill
      - PGPASSFILE=/run/secrets/postgres
    volumes:
      - ethprovider_ipc:/tmp/ipc
    networks:
      - back

  sync:
    image: $syncImage
    deploy:
      mode: global
    depends_on:
      - postgres
    secrets:
      - postgres
    environment:
      - ETH_ADDRESS
      - PGHOST=postgres
      - PGPORT=5432
      - PGUSER=ckmill
      - PGDATABASE=ckmill
      - PGPASSFILE=/run/secrets/postgres
    volumes:
      - ethprovider_ipc:/tmp/ipc
    networks:
      - back

  postgres:
    image: postgres:10
    deploy:
      mode: global
    secrets:
      - postgres
    environment:
      - POSTGRES_USER=ckmill
      - POSTGRES_DB=ckmill
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres
    volumes:
      - postgres:/var/lib/postgresql/data
    networks:
      - back
EOF

docker stack deploy -c /tmp/docker-compose.yml ckmill
rm /tmp/docker-compose.yml
