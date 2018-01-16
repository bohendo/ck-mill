FROM node:alpine

COPY ./build/console.bundle.js /root/ck.js

WORKDIR /root

ENTRYPOINT [ "sleep", "31449600" ]
