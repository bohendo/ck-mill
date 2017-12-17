
##### MAGIC VARIABLES #####

SHELL=/bin/bash # default: /bin/sh
VPATH=src:ops:build

webpack=node_modules/.bin/webpack

##### CALCULATED VARIABLES #####

#v=$(shell grep "\"version\"" ./package.json | egrep -o [0-9.]*)
v=latest

# Input files
js=$(shell find ./src -type f -name "*.js")

# Output files
bundles=ck.bundle.js sync.bundle.js

##### RULES #####
# first rule is the default

all: console sync
	@true

deploy: console sync
	docker push `whoami`/ckmill_console:$v
	docker push `whoami`/ckmill_sync:$v

console: console.Dockerfile ck.bundle.js
	docker build -f ops/console.Dockerfile -t `whoami`/ckmill_console:$v -t ckmill_console:$v .
	mkdir -p build && touch build/console

sync: sync.Dockerfile sync.bundle.js
	docker build -f ops/sync.Dockerfile -t `whoami`/ckmill_sync:$v -t ckmill_sync:$v .
	mkdir -p build && touch build/sync

build/ck.bundle.js: node_modules webpack.console.js $(js)
	$(webpack) --config ops/webpack.console.js

build/sync.bundle.js: node_modules webpack.sync.js $(js)
	$(webpack) --config ops/webpack.sync.js

node_modules: package.json package-lock.json
	npm install

