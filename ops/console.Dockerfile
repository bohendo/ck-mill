FROM ethereum/client-go:stable as base

FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY --from=base /usr/local/bin/geth /usr/local/bin

COPY ./build/ck.bundle.js /root/ck.js

ENTRYPOINT ["/usr/local/bin/geth", "--preload", "/root/ck.js", "attach", "ipc:/tmp/ipc/geth.ipc"]

