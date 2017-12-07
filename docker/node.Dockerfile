FROM node:8.8-alpine

MAINTAINER Bo Henderson <twitter.com/bohendo>

RUN npm install -g nodemon

COPY ./build/server.bundle.js /root/server.bundle.js

ENTRYPOINT ["nodemon", "--exitcrash", "-w", \
  "/root/server.bundle.js", "/root/server.bundle.js"]
