#!/bin/bash

name=ckmill_postgres

id=`for f in $(docker service ps -q $name)
do
  docker inspect --format '{{.Status.ContainerStatus.ContainerID}}' $f
done | head -n1`

echo "Found ckmill_postgres container: $id"

docker exec -it $id bash -c 'psql ckmill ckmill'

