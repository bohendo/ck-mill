FROM node:8.8-alpine

MAINTAINER Bo Henderson <twitter.com/bohendo>

RUN npm install -g nodemon

COPY ./build/txsync.bundle.js /root/txsync.bundle.js

ENTRYPOINT ["nodemon", "--exitcrash", "-w", \
  "/root/txsync.bundle.js", "/root/txsync.bundle.js"]
