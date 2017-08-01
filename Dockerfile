FROM node:8-alpine

ENV MAILIT_VERSION 0.0.2

EXPOSE 3000
ENTRYPOINT [ "/usr/local/bin/mailit" ]

RUN npm install "mailit@$MAILIT_VERSION" -g \
        && npm cache clear --force
