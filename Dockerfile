FROM node:20 as installer
COPY . /juice-shop-ctf
WORKDIR /juice-shop-ctf
RUN chown -R node .
USER node
ARG DEV_BUILD=false
RUN if [ ${DEV_BUILD} = true ]; then npm i && npm lint && npm test && npm run e2e; else npm install --production --unsafe-perm && npm run build; fi

FROM node:20-alpine
ARG BUILD_DATE
ARG VCS_REF
LABEL maintainer="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.title="OWASP Juice Shop CTF-Extension" \
    org.opencontainers.image.description="Capture-the-Flag (CTF) environment setup tools for OWASP Juice Shop" \
    org.opencontainers.image.authors="Bjoern Kimminich <bjoern.kimminich@owasp.org>" \
    org.opencontainers.image.vendor="Open Web Application Security Project" \
    org.opencontainers.image.documentation="https://help.owasp-juice.shop/part1/ctf.html" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.version="11.1.0" \
    org.opencontainers.image.url="https://owasp-juice.shop" \
    org.opencontainers.image.source="https://github.com/juice-shop/juice-shop-ctf.git" \
    org.opencontainers.image.revision=$VCS_REF \
    org.opencontainers.image.created=$BUILD_DATE
COPY --from=installer --chown=node /juice-shop-ctf /juice-shop-ctf
VOLUME /data
WORKDIR /data
RUN chmod +x /juice-shop-ctf/bin/juice-shop-ctf.js
USER node

ENTRYPOINT ["npx", "/juice-shop-ctf/bin/juice-shop-ctf.js"]
