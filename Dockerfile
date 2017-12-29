FROM node:9.3

RUN mkdir -p /container/src

WORKDIR /container/src

COPY . /container/src

RUN npm install --production

RUN sudo apt-get install postgresql-9.6

EXPOSE 80

CMD [ "npm", "start" ]
