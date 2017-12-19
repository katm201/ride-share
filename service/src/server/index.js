import dotenv from 'dotenv';

dotenv.config();

import newrelic from 'newrelic';
import AWS from 'aws-sdk';
// import Credentials from 'aws-sdk/credentials';
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

AWS.config.loadFromPath('./config.json');

// AWS.config.update({ region: 'us-east-2' });

const sqs = new AWS.SQS({
  region: 'us-east-2',
  maxRetries: 15,
  apiVersion: '2012-11-05',
  credentials: new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // sessionToken: null,
  }),
});

// const sqs = new AWS.SQS().client;

// const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

console.log(sqs);

const messageParams = {
  DelaySeconds: 0,
  MessageAttributes: {
    Title: {
      DataType: 'String',
      StringValue: 'New Message!',
    },
    Author: {
      DataType: 'String',
      StringValue: 'Katherine',
    },
  },
  MessageBody: 'First message from Katherine!',
  QueueUrl: process.env.SQS_QUEUE_URL,
};

sqs.sendMessage(messageParams, (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
});

const recieveParams = {
  QueueUrl: process.env.SQS_QUEUE_URL,
};

sqs.receiveMessage(recieveParams, (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
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
  sqs,
};

export default service;
