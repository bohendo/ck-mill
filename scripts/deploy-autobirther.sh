#!/bin/bash

me=`whoami` # Your dockerhub registry/username

image="$me/ckmill_autobirther:latest"

docker pull $image

docker service create \
  --name "autobirther" \
  --mode "global" \
  --env "ETH_PROVIDER=/tmp/ipc/geth.ipc" \
  --env "ETH_ADDRESS=$ETH_ADDRESS" \
  --mount "type=volume,source=ethprovider_ipc,destination=/tmp/ipc" \
  --detach \
  $image

