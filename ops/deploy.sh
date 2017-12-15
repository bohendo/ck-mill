#!/bin/bash

make deploy

if [[ -n "$1" ]]
then
  scp ops/console.sh $1:~
  ssh $1 bash ~/console.sh
fi

