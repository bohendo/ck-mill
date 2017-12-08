FROM node:8.8-alpine

MAINTAINER Bo Henderson <twitter.com/bohendo>

RUN npm install -g nodemon

COPY ./build/blocksync.bundle.js /root/blocksync.bundle.js

ENTRYPOINT ["nodemon", "--exitcrash", "-w", \
  "/root/blocksync.bundle.js", "/root/blocksync.bundle.js"]
