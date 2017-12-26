require('dotenv').config();
const newrelic = require('newrelic');
const express = require('express');
const bodyParser = require('body-parser');
const kue = require('kue');
const events = require('events');
const AWS = require('aws-sdk');

const router = require('./routes');
const pollSQS = require('./helpers/receive-sqs');
const sendMetrics = require('./helpers/send-sqs');
const processQueue = require('./helpers/process-queue');

events.EventEmitter.prototype._maxListeners = 0;

const server = express();

module.exports.queue = kue.createQueue({
  redis: {
    port: process.env.KUE_REDIS_PORT,
    host: process.env.KUE_REDIS_HOST,
  },
});

module.exports.sqs = new AWS.SQS({
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

const kuePollInterval = process.env.KUE_POLL_INTERVAL || 100;
const sqsPollInterval = process.env.SQS_POLL_INTERVAL || 1000;
const metricsInterval = process.env.METRICS_INTERVAL || 300000;

setInterval(() => { pollSQS(); }, sqsPollInterval);
setInterval(() => { sendMetrics(); }, metricsInterval);
setInterval(() => { processQueue.processRides(); }, kuePollInterval);

const port = process.env.PORT || 80;

server.listen(port);
console.log(`Listening on ${port}`);

// module.exports = {
//   queue,
//   server,
//   sqs,
// };
