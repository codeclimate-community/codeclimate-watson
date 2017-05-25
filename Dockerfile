FROM node:7.10-alpine
LABEL maintainer "Tim Evans <tim.c.evans@me.com>"

WORKDIR /usr/src/app/

COPY engine.json ./
COPY package.json yarn.lock ./

RUN apk --update add bash curl git gnupg jq tar && \
    curl -o- --location --silent https://yarnpkg.com/install.sh | /bin/bash --noprofile && \
    yarn install --production --frozen-lockfile --no-progress && \
    yarn cache clean && \
    version="v$(npm -j ls ember-watson | jq -r '.dependencies["ember-watson"].version')" && \
    cat ./engine.json | jq ".version = \"$version\"" > /engine.json && \
    apk del bash curl git gnupg jq tar

RUN adduser -u 9000 -D app
COPY . ./

USER app

WORKDIR /code
VOLUME /code

CMD ["/usr/src/app/bin/ember-watson"]
