import express from 'express';
import bodyParser from 'body-parser';
import kue from 'kue';
import dotenv from 'dotenv';

import router from './routes';
import helpers from './helpers/queue';

dotenv.config();

const server = express();

const queue = kue.createQueue();

server.use(bodyParser.json());

server.use('/', router);

const { checkQueue } = helpers;

setInterval(() => { checkQueue(); }, 10000);

const port = process.env.PORT || 80;

server.listen(port);
console.log(`Listening on ${port}`);

const service = {
  queue,
  server,
};

export default service;
