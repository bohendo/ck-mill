FROM node:alpine

COPY ./build/autobirther.bundle.js /root/autobirther.js

ENTRYPOINT ["node", "/root/autobirther.js"]

