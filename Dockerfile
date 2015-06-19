FROM alpine:edge

WORKDIR /usr/src/app

RUN apk --update add nodejs git ruby ruby-dev build-base && \
  apk del build-base && rm -fr /usr/share/ri && \
  npm install -g mrb/ember-watson.git#4c382bd

COPY . /usr/src/app

CMD ["/usr/src/app/bin/codeclimate-watson"]
