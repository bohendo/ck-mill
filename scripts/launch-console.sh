#!/bin/bash

image="`whoami`/ckmill_console:latest"

docker pull $image

docker run -it --mount "type=volume,source=ethprovider_ipc,target=/tmp/ipc" $image

