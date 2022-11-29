FROM node:alpine

USER node
WORKDIR /home/node

# Install npm modules only if package.json has changed
COPY package.json .
COPY yarn.lock .
RUN \
  set -ex \
  && yarn install
