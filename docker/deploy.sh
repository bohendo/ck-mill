#!/bin/bash

function err { >&2 echo "Error: $1"; exit 1; }

echo "Make sure your webpack --watch is turned off..."
sleep 2

# Make sure the cwd is where it should be
[ -f package.json ] || err 'Deploy from the project root'

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
if ! ssh -q $1 exit 2> /dev/null
then
  err "Couldn't open an ssh connection to $1"
fi

# Make sure project gets rebuilt as the production version
touch src/index.js
make && make deploy

v=$(grep "\"version\"" ./package.json | egrep -o [0-9.]*)

cat docker/compose.yml | ssh $1 "cat - > ~/docker-compose-ckmill.yml"

ssh $1 docker pull bohendo/ckmill_nodejs:$v

ssh $1 'bash -s' <<EOF
# check env vars
export ETH_PROVIDER="$ETH_PROVIDER"
export ETH_ADDRESS="$ETH_ADDRESS"
env | grep ETH
docker stack deploy -c docker-compose-ckmill.yml ckmill
EOF

