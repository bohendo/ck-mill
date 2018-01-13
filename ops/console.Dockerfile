FROM node:alpine

COPY ./build/console.bundle.js /root/ck.js

ENTRYPOINT [ "sleep", "31449600" ]
