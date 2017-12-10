FROM node:8.4.0

RUN mkdir -p /container/src

WORKDIR /container/src

COPY . /container/src

RUN npm install

EXPOSE 3030

CMD [ "npm", "start" ]
