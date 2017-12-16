import express from 'express';
import bodyParser from 'body-parser';
import kue from 'kue';
import dotenv from 'dotenv';
import events from 'events';

import router from './routes';
import helpers from './helpers/queue';

events.EventEmitter.prototype._maxListeners = 0;

dotenv.config();

const server = express();

const queue = kue.createQueue();

server.use(bodyParser.json());

server.use('/', router);

const { checkQueue } = helpers;

setInterval(() => { checkQueue(); }, 10);

const port = process.env.PORT || 80;

server.listen(port);
console.log(`Listening on ${port}`);

const service = {
  queue,
  server,
};

export default service;
