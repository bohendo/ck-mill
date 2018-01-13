#!/bin/bash

image="`whoami`/ckmill_console:latest"

docker pull $image

# TODO: give access to postgres connection data
# container=`docker ls -q -f name="ckmill_console"`
# docker attach $container

docker service rm ckmill_console 2> /dev/null

service=`docker service create \
  --detach \
  --mode global \
  --name ckmill_console \
  --secret postgres \
  --env ETH_ADDRESS \
  --env PGHOST=postgres \
  --env PGPORT=5432 \
  --env PGUSER=ckmill \
  --env PGDATABASE=ckmill \
  --env PGPASSFILE=/run/secrets/postgres \
  --mount "type=volume,source=ethprovider_ipc,target=/tmp/ipc" \
  --network ckmill_back \
  --entrypoint "sleep 300000" \
  $image`

sleep 2

containerid=`docker service ps -q $service | head -n1`
container=`docker inspect --format '{{.NodeID}}{{.Status.ContainerStatus.ContainerID}}' $containerid | head -c25`
containerid=`echo $containerid | head -c25`

echo created service with id: $service
echo container id: $container

sleep 2

docker exec -it ckmill_console.$container.$containerid node -i -r /root/ck.js

