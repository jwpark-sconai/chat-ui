# syntax=docker/dockerfile:1
# Stage that installs the dependencies
FROM node:20 AS builder

WORKDIR /app

ENV API_BASE_URL=https://dev-sconx-api.sconai.com

COPY --link --chown=1000 package-lock.json package.json ./
RUN --mount=type=cache,target=/app/.npm \
        npm set cache /app/.npm && \
        npm ci  # <-- devDependencies도 설치

COPY --link --chown=1000 . .

RUN npm run build

# Final image
FROM node:20-slim AS final

# svelte requires APP_BASE at build time so it must be passed as a build arg
ARG APP_BASE=
# tailwind requires the primary theme to be known at build time so it must be passed as a build arg
ARG PUBLIC_APP_COLOR=blue
ENV BODY_SIZE_LIMIT=15728640

# install dotenv-cli
RUN npm install -g dotenv-cli

# switch to a user that works for spaces
RUN userdel -r node
RUN useradd -m -u 1000 user
USER user

ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

WORKDIR /app

# add a .env.local if the user doesn't bind a volume to it
RUN touch /app/.env.local

# get the default config, the entrypoint script and the server script
COPY --chown=1000 package.json /app/package.json
COPY --chown=1000 .env /app/.env
COPY --chown=1000 entrypoint.sh /app/entrypoint.sh
COPY --chown=1000 gcp-*.json /app/

#import the build & dependencies
COPY --from=builder --chown=1000 /app/build /app/build
COPY --from=builder --chown=1000 /app/node_modules /app/node_modules

RUN npx playwright install

USER root
RUN npx playwright install-deps
USER user

RUN chmod +x /app/entrypoint.sh

CMD ["/bin/bash", "-c", "/app/entrypoint.sh"]
