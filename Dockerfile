FROM node:9.2-alpine
FROM python:2.7-alpine

RUN mkdir -p /container/src

WORKDIR /container/src

COPY . /container/src

RUN npm install --production

EXPOSE 80

CMD [ "npm", "start" ]
