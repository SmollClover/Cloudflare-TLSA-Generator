ARG BUN_VERSION="1.1.17-alpine"

FROM oven/bun:$BUN_VERSION AS builder

COPY build.ts ./

COPY package.json bun.lockb ./
RUN bun i --frozen-lockfile

COPY src ./src/
RUN bun build.ts

FROM oven/bun:$BUN_VERSION

RUN apk upgrade --update-cache --available && apk add openssl
RUN rm -rf /var/cache/apk/*

RUN chown -R bun:bun /home/bun/app
RUN chmod 755 /home/bun/app
    
USER bun

COPY --from=builder /home/bun/app/out/* ./

CMD ["bun", "run", "index.js"]
