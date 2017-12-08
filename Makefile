
##### MAGIC VARIABLES #####

SHELL=/bin/bash # default: /bin/sh
VPATH=src:docker:build

webpack=node_modules/.bin/webpack

##### CALCULATED VARIABLES #####

v=$(shell grep "\"version\"" ./package.json | egrep -o [0-9.]*)

# Input files
js=$(shell find ./src -type f -name "*.js*")

# Output files
bundles=txsync.bundle.js kittysync.bundle.js

##### RULES #####
# first rule is the default

all: txsync kittysync
	@true

deploy: txsync kittysync
	docker build -f docker/txsync.Dockerfile -t `whoami`/ckmill_txsync:$v -t ckmill_txsync:$v .
	docker build -f docker/kittysync.Dockerfile -t `whoami`/ckmill_kittysync:$v -t ckmill_kittysync:$v .

txsync: txsync.Dockerfile txsync.bundle.js
	docker build -f docker/txsync.Dockerfile -t `whoami`/ckmill_txsync:latest -t ckmill_txsync:latest .
	mkdir -p build && touch build/txsync

kittysync: kittysync.Dockerfile kittysync.bundle.js
	docker build -f docker/kittysync.Dockerfile -t `whoami`/ckmill_kittysync:latest -t ckmill_kittysync:latest .
	mkdir -p build && touch build/kittysync

$(bundles): node_modules webpack.config.js $(js)
	$(webpack) --config webpack.config.js

node_modules: package.json package-lock.json
	npm install

