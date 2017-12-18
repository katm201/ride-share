import dotenv from 'dotenv';
dotenv.config();

import newrelic from 'newrelic';

import express from 'express';
import bodyParser from 'body-parser';
import kue from 'kue';
import events from 'events';
import pg from 'pg';

import router from './routes';
import helpers from './helpers/queue';
import db from '../database/index';

events.EventEmitter.prototype._maxListeners = 0;

const server = express();

const queue = kue.createQueue({
  redis: {
    port: process.env.KUE_REDIS_PORT,
    host: process.env.KUE_REDIS_HOST,
  },
});

server.use(bodyParser.json());

server.use('/', router);

const { checkQueue } = helpers;

setInterval(() => { checkQueue(); }, 50);

const port = process.env.PORT || 80;

server.listen(port);
console.log(`Listening on ${port}`);

const service = {
  queue,
  server,
};

export default service;
