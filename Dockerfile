FROM node:9.3

RUN mkdir -p /container/src

WORKDIR /container/src

COPY . /container/src

RUN npm install --production

EXPOSE 80

CMD [ "npm", "start" ]
