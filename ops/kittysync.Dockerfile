FROM ethereum/client-go:stable as base

FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY --from=base /usr/local/bin/geth /usr/local/bin

COPY ./build/kittysync.bundle.js /root/kittysync.js

ENTRYPOINT ["/usr/local/bin/geth", "--exec", "loadScript(\"/root/kittysync.js\")", "attach", "ipc:/tmp/ipc/geth.ipc"]

