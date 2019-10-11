FROM node:11.12.0

# Install a bunch of node modules that are commonly used.
#ADD package.json /usr/app/
ADD . /usr/app/

EXPOSE 80
ENV BIND_HOST=0.0.0.0
CMD ["npm", "start"]
WORKDIR /usr/app

RUN npm install
