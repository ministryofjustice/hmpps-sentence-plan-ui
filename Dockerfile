FROM node:20-bullseye-slim as base
LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"
ENV TZ=Europe/London
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone
RUN addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser --gid 2000
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get autoremove -y && \
    apt-get install -y make python g++ curl && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base as development
ARG BUILD_NUMBER=1_0_0
ARG GIT_REF=not-available
ENV BUILD_NUMBER ${BUILD_NUMBER}
ENV GIT_REF ${GIT_REF}
ENV NODE_ENV='development'

FROM base as build
ARG BUILD_NUMBER=1_0_0
ARG GIT_REF=not-available
ENV BUILD_NUMBER ${BUILD_NUMBER}
ENV GIT_REF ${GIT_REF}
COPY . .
RUN rm -rf dist node_modules
RUN CYPRESS_INSTALL_BINARY=0 npm ci --no-audit
RUN npm run build
RUN npm run record-build-info
RUN npm prune --no-audit --omit=dev

FROM base AS production
COPY --from=build --chown=appuser:appgroup /app/package.json /app/package-lock.json ./
COPY --from=build --chown=appuser:appgroup /app/build-info.json ./dist/build-info.json
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/docker/healthcheck.js ./docker/healthcheck.js
EXPOSE 3000 3001
ENV NODE_ENV='production'
USER 2000
CMD ["npm", "start"]
