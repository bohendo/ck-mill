#!/bin/bash

function err { >&2 echo "Error: $1"; exit 1; }

# Make sure the cwd is where it should be
[ -f package.json ] || err 'Deploy from the project root'

v=$(grep "\"version\"" ./package.json | egrep -o [0-9.]*)

make deploy

target="$1"
if [ -z "$target" ]
then
  cat docker/compose.yml | sed 's/$v/'"$v"'/' > /tmp/docker-compose-ckmill.yml
  docker stack deploy -c /tmp/docker-compose-ckmill.yml ckmill
  exit 0
fi

cat docker/compose.yml | sed 's/$v/'"$v"'/' | ssh $target "cat - > ~/docker-compose-ckmill.yml"

ssh $target docker pull bohendo/ckmill_kittysync:$v
ssh $target docker pull bohendo/ckmill_salesync:$v
ssh $target docker pull bohendo/ckmill_breeder:$v

ssh $target 'bash -s' <<EOF
# check env vars
export ETH_PROVIDER="$ETH_PROVIDER"
export ETH_ADDRESS="$ETH_ADDRESS"
env | grep ETH
docker stack deploy -c docker-compose-ckmill.yml ckmill
EOF

