
##### MAGIC VARIABLES #####

SHELL=/bin/bash # default: /bin/sh
VPATH=src:ops:build

webpack=node_modules/.bin/webpack

##### CALCULATED VARIABLES #####

#v=$(shell grep "\"version\"" ./package.json | egrep -o [0-9.]*)
v=latest
me=$(shell whoami)

# Input files
js=$(shell find ./src -type f -name "*.js")

# Make sure our build directory exists
$(shell mkdir -p build)

##### RULES #####
# first rule is the default

all: console-image sync-image autobirther-image
	@true

deploy: console-image sync-image autobirther-image
	docker push $(me)/ckmill_console:$v
	docker push $(me)/ckmill_sync:$v
	docker push $(me)/ckmill_autobirther:$v

build/console: console-image
	docker push $(me)/ckmill_console:$v
	touch build/console

build/sync: sync-image
	docker push $(me)/ckmill_sync:$v
	touch build/sync

build/autobirther: autobirther-image
	docker push $(me)/ckmill_autobirther:$v
	touch build/autobirther

build/console-image: console.Dockerfile ck.bundle.js
	docker build -f ops/console.Dockerfile -t $(me)/ckmill_console:$v -t ckmill_console:$v .
	touch build/console-image

build/sync-image: sync.Dockerfile sync.bundle.js
	docker build -f ops/sync.Dockerfile -t $(me)/ckmill_sync:$v -t ckmill_sync:$v .
	touch build/sync-image

build/autobirther-image: autobirther.Dockerfile autobirther.bundle.js
	docker build -f ops/autobirther.Dockerfile -t $(me)/ckmill_autobirther:$v -t ckmill_autobirther:$v .
	touch build/autobirther-image

build/ck.bundle.js: node_modules webpack.geth.js $(js)
	$(webpack) --config ops/webpack.geth.js

build/autobirther.bundle.js build/sync.bundle.js: node_modules webpack.web3.js $(js)
	$(webpack) --config ops/webpack.web3.js

node_modules: package.json
	npm install

