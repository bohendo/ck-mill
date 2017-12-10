
##### MAGIC VARIABLES #####

SHELL=/bin/bash # default: /bin/sh
VPATH=src:docker:build

webpack=node_modules/.bin/webpack

##### CALCULATED VARIABLES #####

v=$(shell grep "\"version\"" ./package.json | egrep -o [0-9.]*)

# Input files
js=$(shell find ./src -type f -name "*.js*")

# Output files
bundles=salesync.bundle.js kittysync.bundle.js

##### RULES #####
# first rule is the default

all: salesync kittysync
	@true

deploy: salesync kittysync
	docker build -f docker/salesync.Dockerfile -t `whoami`/ckmill_salesync:$v -t ckmill_salesync:$v .
	docker build -f docker/kittysync.Dockerfile -t `whoami`/ckmill_kittysync:$v -t ckmill_kittysync:$v .
	docker push `whoami`/ckmill_salesync:$v
	docker push `whoami`/ckmill_kittysync:$v

salesync: salesync.Dockerfile salesync.bundle.js
	docker build -f docker/salesync.Dockerfile -t `whoami`/ckmill_salesync:latest -t ckmill_salesync:latest .
	mkdir -p build && touch build/salesync

kittysync: kittysync.Dockerfile kittysync.bundle.js
	docker build -f docker/kittysync.Dockerfile -t `whoami`/ckmill_kittysync:latest -t ckmill_kittysync:latest .
	mkdir -p build && touch build/kittysync

$(bundles): node_modules webpack.config.js $(js)
	$(webpack) --config webpack.config.js

node_modules: package.json package-lock.json
	npm install

