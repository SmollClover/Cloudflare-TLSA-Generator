FROM oven/bun:1.1.16-alpine AS builder

WORKDIR /app

COPY build.ts ./

COPY package.json bun.lockb ./
RUN bun i --frozen-lockfile

COPY src ./src/
RUN bun build.ts

FROM oven/bun:1.1.16-alpine

WORKDIR /app

RUN apk upgrade --update-cache --available && \
    apk add openssl && \
    rm -rf /var/cache/apk/*

COPY --from=builder /app/out/* ./

CMD ["bun", "run", "index.js"]
