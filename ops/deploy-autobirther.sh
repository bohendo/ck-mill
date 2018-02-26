#!/bin/bash

ethprovider=parity

image="`whoami`/ckmill_autobirther:latest"

docker pull $image

docker service create \
  --name "ckmill_autobirther" \
  --mode "global" \
  --secret "autobirther" \
  --secret "postgres" \
  --env "ETH_ADDRESS=$ETH_ADDRESS" \
  --env "ETH_PROVIDER=/tmp/ipc/$ethprovider.ipc" \
  --network "ckmill_back" \
  --env "PGHOST=postgres" \
  --env "PGPORT=5432" \
  --env "PGUSER=ckmill" \
  --env "PGDATABASE=ckmill" \
  --env "PGPASSFILE=/run/secrets/postgres" \
  --mount "type=volume,source=ethprovider_ipc,destination=/tmp/ipc" \
  --detach \
  $image

