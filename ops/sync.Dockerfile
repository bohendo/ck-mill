FROM node:alpine

COPY ./build/sync.bundle.js /root/sync.js

ENTRYPOINT ["node", "/root/sync.js"]

