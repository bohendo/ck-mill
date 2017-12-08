
##### MAGIC VARIABLES #####

SHELL=/bin/bash # default: /bin/sh
VPATH=src:docker:build

webpack=node_modules/.bin/webpack

##### CALCULATED VARIABLES #####

v=$(shell grep "\"version\"" ./package.json | egrep -o [0-9.]*)

# Input files
js=$(shell find ./src -type f -name "*.js*")

# Output files
bundles=blocksync.bundle.js kittysync.bundle.js

##### RULES #####
# first rule is the default

all: blocksync kittysync
	@true

deploy: blocksync kittysync
	docker build -f docker/blocksync.Dockerfile -t `whoami`/ckmill_blocksync:$v -t ckmill_blocksync:$v .
	docker build -f docker/kittysync.Dockerfile -t `whoami`/ckmill_kittysync:$v -t ckmill_kittysync:$v .

blocksync: blocksync.Dockerfile blocksync.bundle.js
	docker build -f docker/blocksync.Dockerfile -t `whoami`/ckmill_blocksync:latest -t ckmill_blocksync:latest .
	mkdir -p build && touch build/blocksync

kittysync: kittysync.Dockerfile kittysync.bundle.js
	docker build -f docker/kittysync.Dockerfile -t `whoami`/ckmill_kittysync:latest -t ckmill_kittysync:latest .
	mkdir -p build && touch build/kittysync

$(bundles): node_modules webpack.config.js $(js)
	$(webpack) --config webpack.config.js

node_modules: package.json package-lock.json
	npm install

