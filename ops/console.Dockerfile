FROM node:alpine

COPY ./build/console.bundle.js /root/ck.js

ENTRYPOINT [ "node", "-i", "-r", "/root/ck.js" ]
