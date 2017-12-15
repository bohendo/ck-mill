
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
bundles=ck.bundle.js

##### RULES #####
# first rule is the default

all: console
	@true

deploy: console
	docker push `whoami`/ckmill_console:$v

console: console.Dockerfile ck.bundle.js
	docker build -f ops/console.Dockerfile -t `whoami`/ckmill_console:$v -t ckmill_console:$v .
	mkdir -p build && touch build/console

$(bundles): node_modules webpack.config.js $(js)
	$(webpack) --config ops/webpack.config.js

node_modules: package.json package-lock.json
	npm install

