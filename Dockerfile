FROM mhart/alpine-node:5.4

WORKDIR /usr/src/app
COPY npm-shrinkwrap.json /usr/src/app/
COPY package.json /usr/src/app/

RUN apk --update add git && \
    npm install && \
    apk del --purge git

COPY . /usr/src/app

RUN adduser -u 9000 -D app

USER app

CMD ["/usr/src/app/bin/ember-watson.js"]
