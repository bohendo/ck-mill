#!/bin/bash

name=ckmill_console
image="`whoami`/$name:latest"

# duplicate the stdout file descriptor
exec 5>&1

# print & capture output
pullout=`docker pull $image | tee /dev/fd/5`

if [[ -z "`echo $pullout | grep "up to date"`" ]]
then
  docker service update --image $image $name
fi

containerid=`docker service ps -q $name | head -n1`

# name of container deployed as a docker swarm includes the first 25 chars of each id
container=`docker inspect --format '{{.NodeID}}{{.Status.ContainerStatus.ContainerID}}' $containerid | head -c25`
containerid=`echo $containerid | head -c25`

echo docker exec -it $name.$container.$containerid node -i -r /root/ck.js
docker exec -it $name.$container.$containerid node -i -r /root/ck.js

