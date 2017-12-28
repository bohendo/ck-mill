FROM ethereum/client-go:stable as base

FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY --from=base /usr/local/bin/geth /usr/local/bin

COPY ./build/autobirther.bundle.js /root/autobirther.js

ENTRYPOINT ["/usr/local/bin/geth", "--preload", "/root/autobirther.js", "attach", "ipc:/tmp/ipc/geth.ipc"]

