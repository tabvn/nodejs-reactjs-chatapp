FROM node:11.12.0
#RUN apk add --update \ libc6-compat
# Install a bunch of node modules that are commonly used.
#ADD package.json /usr/app/
ADD . /usr/app/

WORKDIR /usr/app
RUN npm cache clean -f
RUN npm install -g n
RUN n 8.4.0


RUN npm install uNetworking/uWebSockets.js#v15.11.0
RUN npm install
RUN npm rebuild uws 
