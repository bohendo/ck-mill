FROM node:8.8-alpine

MAINTAINER Bo Henderson <twitter.com/bohendo>

RUN npm install -g nodemon

COPY ./build/salesync.bundle.js /root/salesync.bundle.js

ENTRYPOINT ["nodemon", "--exitcrash", "-w", \
  "/root/salesync.bundle.js", "/root/salesync.bundle.js"]
