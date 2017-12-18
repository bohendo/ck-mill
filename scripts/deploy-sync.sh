#!/bin/bash

image="`whoami`/ckmill_sync:latest"

docker pull $image

cat -> /tmp/docker-compose.yml <<EOF
version: '3.4'

secrets:
  geth:
    external: true
  postgres:
    external: true

volumes:
  postgres:
  ethprovider_ipc:
    external: true

networks:
  back:

services:

  sync:
    image: $image
    deploy:
      mode: global
    depends_on:
      - postgres
    secrets:
      - postgres
    environment:
      - ETH_PROVIDER=/tmp/ipc/geth.ipc
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
