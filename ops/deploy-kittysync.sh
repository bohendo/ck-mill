#!/bin/bash

image="`whoami`/ckmill_kittysync:latest"
name=ckmill_kittysync

docker pull $image

if [[ -n "`docker service ls -f name=$name -q`" ]]
then

  docker service update --detach --image $image $name

else

  docker service create \
    --name "$name" \
    --mode "global" \
    --mount "type=volume,source=ethprovider_ipc,destination=/tmp/ipc" \
    --restart-condition "none" \
    --detach \
    $image

fi
