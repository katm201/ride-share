import dotenv from 'dotenv';

dotenv.config();

import newrelic from 'newrelic';
import express from 'express';
import bodyParser from 'body-parser';
import kue from 'kue';
import events from 'events';
import AWS from 'aws-sdk';

import router from './routes';
import checkQueue from './helpers/queue';
import pollSQS from './helpers/receive-sqs';
import sendMetrics from './helpers/send-sqs';

events.EventEmitter.prototype._maxListeners = 0;

const server = express();

const queue = kue.createQueue({
  redis: {
    port: process.env.KUE_REDIS_PORT,
    host: process.env.KUE_REDIS_HOST,
  },
});

const sqs = new AWS.SQS({
  region: 'us-east-2',
  maxRetries: 15,
  apiVersion: '2012-11-05',
  credentials: new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }),
});

server.use(bodyParser.json());

server.use('/', router);

const sqsPollInterval = process.env.SQS_POLL_INTERVAL || 1000;
const kuePollInterval = process.env.KUE_POLL_INTERVAL || 250;
const metricsInterval = process.env.METRICS_INTERVAL || 300000;

setInterval(() => { checkQueue(); }, kuePollInterval);
setInterval(() => { pollSQS(); }, sqsPollInterval);
setInterval(() => { sendMetrics(); }, metricsInterval);

const port = process.env.PORT || 80;

server.listen(port);
console.log(`Listening on ${port}`);

const service = {
  queue,
  server,
  sqs,
};

export default service;
