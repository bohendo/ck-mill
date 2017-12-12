FROM node:8.8-alpine

MAINTAINER Bo Henderson <twitter.com/bohendo>

RUN npm install -g nodemon

COPY ./build/breeder.bundle.js /root/breeder.bundle.js

ENTRYPOINT ["nodemon", "--exitcrash", "-w", \
  "/root/breeder.bundle.js", "/root/breeder.bundle.js"]
