FROM node:9.3

RUN mkdir -p /container/src

WORKDIR /container/src

COPY . /container/src

RUN npm install --production

RUN apt-get update && apt-get install -y postgresql-9.6

EXPOSE 80

CMD [ "npm", "start" ]
