
##### MAGIC VARIABLES #####

SHELL=/bin/bash # default: /bin/sh
VPATH=src:docker:build

webpack=node_modules/.bin/webpack

##### CALCULATED VARIABLES #####

v=$(shell grep "\"version\"" ./package.json | egrep -o [0-9.]*)

# Input files
js=$(shell find ./src -type f -name "*.js*")

# Output files
bundles=salesync.bundle.js kittysync.bundle.js breeder.bundle.js

##### RULES #####
# first rule is the default

all: salesync kittysync breeder
	@true

deploy: salesync kittysync breeder
	docker build -f docker/salesync.Dockerfile -t `whoami`/ckmill_salesync:$v -t ckmill_salesync:$v .
	docker build -f docker/kittysync.Dockerfile -t `whoami`/ckmill_kittysync:$v -t ckmill_kittysync:$v .
	docker build -f docker/breeder.Dockerfile -t `whoami`/ckmill_breeder:$v -t ckmill_breeder:$v .
	docker push `whoami`/ckmill_salesync:$v
	docker push `whoami`/ckmill_kittysync:$v
	docker push `whoami`/ckmill_breeder:$v

salesync: salesync.Dockerfile salesync.bundle.js
	docker build -f docker/salesync.Dockerfile -t `whoami`/ckmill_salesync:latest -t ckmill_salesync:latest .
	mkdir -p build && touch build/salesync

kittysync: kittysync.Dockerfile kittysync.bundle.js
	docker build -f docker/kittysync.Dockerfile -t `whoami`/ckmill_kittysync:latest -t ckmill_kittysync:latest .
	mkdir -p build && touch build/kittysync

breeder: breeder.Dockerfile breeder.bundle.js
	docker build -f docker/breeder.Dockerfile -t `whoami`/ckmill_breeder:latest -t ckmill_breeder:latest .
	mkdir -p build && touch build/breeder

$(bundles): node_modules webpack.config.js $(js)
	$(webpack) --config webpack.config.js

node_modules: package.json package-lock.json
	npm install

