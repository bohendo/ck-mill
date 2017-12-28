
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

##### RULES #####
# first rule is the default

all: console sync autobirther
	@true

deploy: console sync autobirther
	docker push $(me)/ckmill_console:$v
	docker push $(me)/ckmill_sync:$v
	docker push $(me)/ckmill_autobirther:$v

console: console.Dockerfile ck.bundle.js
	docker build -f ops/console.Dockerfile -t $(me)/ckmill_console:$v -t ckmill_console:$v .
	mkdir -p build && touch build/console

sync: sync.Dockerfile sync.bundle.js
	docker build -f ops/sync.Dockerfile -t $(me)/ckmill_sync:$v -t ckmill_sync:$v .
	mkdir -p build && touch build/sync

autobirther: autobirther.Dockerfile autobirther.bundle.js
	docker build -f ops/autobirther.Dockerfile -t $(me)/ckmill_autobirther:$v -t ckmill_autobirther:$v .
	mkdir -p build && touch build/autobirther

build/ck.bundle.js: node_modules webpack.console.js $(js)
	$(webpack) --config ops/webpack.console.js

build/sync.bundle.js: node_modules webpack.sync.js $(js)
	$(webpack) --config ops/webpack.sync.js

build/autobirther.bundle.js: node_modules webpack.autobirther.js $(js)
	$(webpack) --config ops/webpack.autobirther.js

node_modules: package.json
	npm install

