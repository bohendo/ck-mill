
##### MAGIC VARIABLES #####

SHELL=/bin/bash # default: /bin/sh

webpack=node_modules/.bin/webpack

##### CALCULATED VARIABLES #####

v=$(shell grep "\"version\"" ./package.json | egrep -o [0-9.]*)

# Input files
js=$(shell find . -type f -name "*.js*")

##### RULES #####
# first rule is the default

all: nodejs
	@true

deploy: nodejs
	docker build -f Dockerfile -t `whoami`/ckmil_nodejs:$v .
	docker push `whoami`/ckmil_nodejs:$v

nodejs: Dockerfile server.bundle.js
	docker build -f Dockerfile -t `whoami`/ckmil_nodejs:latest -t ckmil_nodejs:latest .
	mkdir -p build && touch build/nodejs

server.bundle.js: node_modules webpack.config.js $(js)
	$(webpack) --config webpack.config.js

node_modules: package.json package-lock.json
	npm install

