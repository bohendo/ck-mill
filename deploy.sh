#!/bin/bash

function err { >&2 echo "Error: $1"; exit 1; }

echo "Make sure your webpack --watch is turned off..."
sleep 2

# Make sure the cwd is where it should be
[ -f package.json ] || err 'Deploy from the project root'

v=$(grep "\"version\"" ./package.json | egrep -o [0-9.]*)

target="$1"
if [ -z "$target" ]
then
  touch package.json && make deploy
  cat docker/compose.yml | sed 's/$v/'"$v"'/' > /tmp/docker-compose-ckmill.yml
  docker stack deploy -c /tmp/docker-compose-ckmill.yml ckmill
  exit 0
fi

# Don't deploy if we're on master
branch=`git rev-parse --abbrev-ref HEAD`
if [[ ${branch:0:7} != 'release' ]]
then
  err "Don't deploy this branch, that's what release branches are for"
fi

# Don't deploy if there are uncommitted changes
if [[ `git status --short | wc -l` -ne 0 ]]
then
  err "Commit your changes first"
fi

# Make sure we can ssh to the machine we're deploying to
if ! ssh -q $target exit 2> /dev/null
then
  err "Couldn't open an ssh connection to $target"
fi

# Make sure project gets rebuilt as the production version
touch package.json && make deploy

cat docker/compose.yml | sed 's/$v/'"$v"'/' | ssh $target "cat - > ~/docker-compose-ckmill.yml"

ssh $target docker pull bohendo/ckmill_nodejs:$v

ssh $target 'bash -s' <<EOF
# check env vars
export ETH_PROVIDER="$ETH_PROVIDER"
export ETH_ADDRESS="$ETH_ADDRESS"
env | grep ETH
docker stack deploy -c docker-compose-ckmill.yml ckmill
EOF

