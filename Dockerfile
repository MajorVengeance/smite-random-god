FROM ubuntu:latest
RUN apt-get update && apt-get install -y
RUN apt-get install npm -y
#RUN apk add sqlite
#RUN apk add npm
COPY ./commands ./commands
COPY ./test ./test
COPY ./config.json ./config.json
COPY ./gods.json ./gods.json
COPY ./index.js ./index.js
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm --version
RUN node --version
RUN npm install
RUN node .
