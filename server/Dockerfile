FROM ubuntu:18.04
#RUN apk add --update \ libc6-compat
# Install a bunch of node modules that are commonly used.
#ADD package.json /usr/app/
RUN apt-get update && apt-get -qq -y install curl


ENV NODE_VERSION=9.9.0
RUN apt-get install -y curl
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version
ADD . /usr/app/

WORKDIR /usr/app
#RUN npm install -g n
#RUN n 8.4.0


#RUN npm install uNetworking/uWebSockets.js#v15.11.0
RUN npm install
#RUN npm rebuild uws 
