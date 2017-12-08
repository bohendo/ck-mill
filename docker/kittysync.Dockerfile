FROM node:8.8-alpine

MAINTAINER Bo Henderson <twitter.com/bohendo>

RUN npm install -g nodemon

COPY ./build/kittysync.bundle.js /root/kittysync.bundle.js

ENTRYPOINT ["nodemon", "--exitcrash", "-w", \
  "/root/kittysync.bundle.js", "/root/kittysync.bundle.js"]
